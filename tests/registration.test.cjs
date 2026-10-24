const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
function load() {
 const button = {innerHTML:'Registrarse', disabled:false};
 const ctx = vm.createContext({window:{}, console, alert:()=>{}, localStorage:{getItem:()=>null}, document:{addEventListener:()=>{}, getElementById:()=>null, querySelector:()=>button}});
 vm.runInContext(readFileSync('javascripts/utils/landing_spa.js','utf8'),ctx);
 return {ctx,button};
}
const payload = {correo:'test@example.com', contrasena:'TestPassword123!', confirmar_contrasena:'TestPassword123!', razon_social:'Negocio', nombre_usuario:'negocio', ruc:'RUC-1', telefono:'88887777'};
test('registration submits API role identifiers and real business details',async()=>{
 for (const [isProvider,role] of [[false,'restaurant'],[true,'provider']]) {
  const {ctx,button}=load(); let sent;
  ctx.window.api={register:async data=>{sent=data;return {success:false,error:'test'};}};
  await ctx.window.handleRegister(payload,isProvider);
  assert.equal(sent.rol,role); assert.equal(sent.ruc,'RUC-1'); assert.equal(sent.telefono,'88887777'); assert.equal(button.disabled,false);
 }
});
test('missing data and mismatched confirmation never call registration API',async()=>{
 const {ctx}=load();let calls=0;ctx.window.api={register:async()=>{calls++;}};
 await ctx.window.handleRegister({...payload,telefono:''},false);
 await ctx.window.handleRegister({...payload,confirmar_contrasena:'wrong'},false);
 assert.equal(calls,0);
});
test('unexpected network failure restores submit button',async()=>{
 const {ctx,button}=load();ctx.window.api={register:async()=>{throw Error('offline');}};
 await ctx.window.handleRegister(payload,true);
 assert.equal(button.disabled,false); assert.equal(button.innerHTML,'Registrarse');
});
