const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const {readFileSync} = require('node:fs');
function context(saved=null, dark=false, blocked=false) {
 const handlers={}, mediaHandlers={}, attrs={};
 const button={setAttribute:(key,value)=>{attrs[key]=value;},textContent:''};
 const root={dataset:{},style:{}};
 const values=new Map(saved ? [['tradconnect_theme',saved]]:[]);
 const media={matches:dark,addEventListener:(name,fn)=>{mediaHandlers[name]=fn;}};
 const ctx=vm.createContext({window:{matchMedia:()=>media,addEventListener:(name,fn)=>{handlers['window:'+name]=fn;}},document:{documentElement:root,querySelectorAll:()=>[button],getElementById:()=>null,addEventListener:(name,fn)=>{handlers[name]=fn;}},localStorage:{getItem:key=>{if(blocked)throw Error();return values.get(key)||null;},setItem:(key,value)=>{if(blocked)throw Error();values.set(key,value);}}});
 vm.runInContext(readFileSync('javascripts/utils/theme.js','utf8'),ctx);
 ctx.window.theme.init();
 return {ctx,root,handlers,mediaHandlers,attrs,button,values};
}
test('theme uses system initially and persists explicit choice',()=>{
 const c=context(null,true);assert.equal(c.root.dataset.theme,'dark');
 c.handlers.click({target:{closest:()=>c.button}});
 assert.equal(c.root.dataset.theme,'light');assert.equal(c.values.get('tradconnect_theme'),'light');assert.equal(c.attrs['aria-pressed'],'false');
 c.mediaHandlers.change({matches:true});assert.equal(c.root.dataset.theme,'light');
});
test('saved preference survives initialization and synchronizes across tabs',()=>{
 const c=context('light',true);assert.equal(c.root.dataset.theme,'light');
 c.handlers['window:storage']({key:'tradconnect_theme',newValue:'dark'});assert.equal(c.root.dataset.theme,'dark');
});
test('blocked storage does not break theme switching',()=>{
 const c=context(null,false,true);c.handlers.click({target:{closest:()=>c.button}});assert.equal(c.root.dataset.theme,'dark');
});
