const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const {readFileSync}=require('node:fs');
function load(){
 const values=new Map(), intervals=new Map(), listeners={};let next=0;
 const ctx=vm.createContext({window:{addEventListener:(type,fn)=>{listeners[type]=fn;}},document:{hidden:false,addEventListener:(type,fn)=>{listeners[type]=fn;},getElementById:()=>null},console:{log(){},error(){},warn(){}},URLSearchParams,AbortController,localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)},setInterval:(fn,delay)=>{intervals.set(++next,{fn,delay});return next;},clearInterval:id=>intervals.delete(id),clearTimeout(){}});
 vm.runInContext(readFileSync('javascripts/utils/common.js','utf8'),ctx);ctx.appUtils=ctx.window.appUtils;
 vm.runInContext(readFileSync('javascripts/utils/api.js','utf8'),ctx);ctx.api=ctx.window.api;
 vm.runInContext(readFileSync('javascripts/marketplace.js','utf8'),ctx);
 const m=ctx.window.marketplace;m._injectStyles=()=>{};m.setupEvents=()=>{};m.renderCategories=()=>{};m.renderProducts=()=>{};
 return {ctx,m,values,intervals,listeners};
}
test('preload and entry share pending network request and refresh bypasses cache',async()=>{
 const {ctx,values}=load();let calls=0,resolve;
 ctx.api.publicRequest=async(path,options,useCache)=>{calls++;assert.equal(useCache,false);assert.equal(options.cache,'no-store');return new Promise(done=>{resolve=done;});};
 const first=ctx.api.getMarketplaceProducts({},true),second=ctx.api.getMarketplaceProducts({},true);
 assert.equal(calls,1);resolve({success:true,data:[{id:1}],fromCache:false});await Promise.all([first,second]);assert.equal(JSON.parse(values.get('marketplace_all')).data[0].id,1);
 const third=ctx.api.getMarketplaceProducts({},true);assert.equal(calls,2);resolve({success:true,data:[],fromCache:false});await third;
});
test('marketplace renders cached products before network and cleans recurring refresh on exit',async()=>{
 const {ctx,m,values,intervals}=load();values.set('marketplace_all',JSON.stringify({data:[{id:7,nombreproducto:'Arroz'}]}));
 let resolve;ctx.api.getMarketplaceProducts=()=>new Promise(done=>{resolve=done;});
 let rendered=0;m.renderProducts=()=>{rendered++;};
 const pending=m.init();assert.equal(m.products[0].id,7);assert.equal(rendered,1);assert.equal([...intervals.values()][0].delay,60000);
 m.destroy();assert.equal(intervals.size,0);resolve({success:true,data:[{id:8}]});await pending;assert.equal(rendered,1);
});
test('silent offline refresh preserves existing products without a notification',async()=>{
 const {ctx,m}=load();m.products=[{id:4}];let notified=false;m.showToast=()=>{notified=true;};ctx.api.getMarketplaceProducts=async()=>({success:false,error:'offline'});
 assert.equal(await m.loadProducts({},true,true),false);assert.equal(m.products[0].id,4);assert.equal(notified,false);
});
test('hidden tab skips recurring refresh',async()=>{
 const {ctx,m,intervals}=load();let calls=0;ctx.api.getMarketplaceProducts=async()=>{calls++;return {success:true,data:[]};};await m.init();assert.equal(calls,1);
 ctx.document.hidden=true;await [...intervals.values()][0].fn();assert.equal(calls,1);m.destroy();
});
test('product mapping retains promotion and branch data without inventing an origin',()=>{
 const {m}=load();
 m.acceptProducts([{id:17,nombreproducto:'Frijol',precioventa:'100',precio_final:'85',precio_original:'100',descuento:15,promocion_activa:true,cantidadminimapedido:2,esperecedero:true,diasvidautil:30,empresa_id:4,empresa_nombre:'Proveedor Norte',categoriaid:3,categoria_nombre:'Granos',unidadmedidaid:2,unidad_nombre:'Kilogramo',sucursal_origen_id:8,inventario:[{sucursal_id:8,sucursal_nombre:'Central',stock:12,direccion:'Mercado Central'}],promociones:[{descripcion:'Oferta mayorista',porcentaje_descuento:15,cantidad_minima:2}]}]);
 const product=m.products[0];
 assert.equal(product.stock_disponible,12);
 assert.equal(product.cantidad_minima,2);
 assert.equal(product.promociones[0].descripcion,'Oferta mayorista');
 assert.equal(product.inventario[0].direccion,'Mercado Central');
 assert.equal(product.origin,'');
 assert.equal(product.raw.categoriaid,3);
});
test('product detail includes branch availability and active promotion with escaped data',()=>{
 const {m,ctx}=load();let html='',inserted=false;const modal={dataset:{}};
 ctx.document.getElementById=id=>id==='productDetailModal'&&inserted?modal:null;
 ctx.document.body={insertAdjacentHTML:(_position,value)=>{html=value;inserted=true;}};
 m._openDetailModal({id:17,name:'Frijol <rojo>',description:'Cosecha & limpia',price:85,originalPrice:100,discount:15,isOffer:true,category:'Granos',categoryId:3,proveedorId:4,proveedorNombre:'Proveedor Norte',sucursalOrigenId:8,img:'assets/product-placeholder.svg',unidad:'Kilogramo',unitId:2,cantidad_minima:2,es_perecedero:true,dias_vida_util:30,stock_disponible:12,origin:'',raw:{},inventario:[{sucursal_id:8,sucursal_nombre:'Central',stock:12,direccion:'Mercado Central'}],promociones:[{descripcion:'Oferta mayorista',porcentaje_descuento:15,cantidad_minima:2}]});
 assert.match(html,/Frijol &lt;rojo&gt;/);
 assert.match(html,/Mercado Central/);
 assert.match(html,/Oferta mayorista/);
 assert.match(html,/Cantidad mínima de compra/);
 assert.match(html,/Añadir al carrito \(2\)/);
 assert.ok(!html.includes('Nicaragua'));
});
