const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {readFileSync} = require('node:fs');
function load(role='Cliente') {
 const nodes=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{disabled:false,hidden:false,textContent:''});return nodes.get(id);};
 let calls=0;
 const ctx=vm.createContext({window:{},document:{getElementById:node,querySelector:()=>node('submit')},appUtils:{readJSON:()=>({rol_nombre:role})},api:{getDocumentSchemas:async()=>{calls++;return {success:false,error:'Acceso denegado por el servidor'};}}});
 vm.runInContext(readFileSync('javascripts/documents.js','utf8'),ctx);
 return {module:ctx.window.documents,node,calls:()=>calls};
}
test('collection labels preserve all thirteen names and approved Spanish labels',()=>{
 const {module:m}=load();
 assert.equal(Object.keys(m.collections).length,13);
 assert.equal(m.collectionLabel('usuarios_empresas_roles'),'Usuarios, empresas y roles');
 assert.equal(m.collectionLabel('comentarios_post_compra'),'Comentarios poscompra');
 assert.equal(m.collectionLabel('preferencias_metodos_pago'),'Preferencias de métodos de pago');
 for(const [key,[label]] of Object.entries(m.collections)){
  assert.match(key,/^[a-z]+(?:_[a-z]+)*$/);
  assert.ok(label.trim().length>0,key);
 }
});
test('nonadministrators cannot initialize the form or request schemas',async()=>{
 const c=load();await c.module.init();assert.equal(c.calls(),0);assert.equal(c.node('mongoForm').hidden,true);assert.equal(c.node('submit').disabled,true);
});
test('server permission errors leave administrative controls disabled',async()=>{
 const c=load('Administrador');await c.module.init();assert.equal(c.calls(),1);assert.equal(c.node('mongoCollection').disabled,true);assert.equal(c.node('submit').disabled,true);assert.equal(c.node('mongoStatus').textContent,'Acceso denegado por el servidor');
});
test('display formatting preserves zero, labels booleans and translates fields',()=>{
 const {module:m}=load();assert.equal(m.displayValue(0),'0');assert.equal(m.displayValue(false),'No');assert.equal(m.fieldLabel('categoria_id_sql'),'Categoría ID SQL');
});
test('document CRUD feedback assigns a semantic visual state to the message',()=>{
 const {module:m,node}=load();m.status('Documento guardado','success');assert.equal(node('mongoStatus').textContent,'Documento guardado');assert.equal(node('mongoStatus').className,'mongo-status is-success');
 m.status('No se pudo guardar','error');assert.equal(node('mongoStatus').className,'mongo-status is-error');
});
