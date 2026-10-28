import {test} from 'node:test';
import assert from 'node:assert/strict';
import {language,translate,translateSchema} from '../src/i18n.js';
import {format,stateText} from '../src/core.js';
test('automatic language follows Home Assistant and explicit choices override it',()=>{
 assert.equal(language({}, {language:'en-GB'}),'en');
 assert.equal(language({}, {language:'es-ES'}),'es');
 assert.equal(language({language:'es'}, {language:'en'}),'es');
 assert.equal(language({language:'en'}, {language:'es'}),'en');
});
test('interface strings and number formatting support both languages',()=>{
 assert.equal(translate('＋ Añadir bloque','en'),'＋ Add block');
 assert.equal(translate('Sin datos','es'),'Sin datos');
 assert.equal(format(12.5,1,'en'),'12.5');
 assert.equal(format(12.5,1,'es'),'12,5');
});
test('schema translation preserves stored values and user text',()=>{
 const schema=[{selector:{select:{options:[{value:'small',label:'Pequeño'}]}}}];
 assert.deepEqual(translateSchema(schema,'en')[0].selector.select.options,[{value:'small',label:'Small'}]);
 assert.equal(schema[0].selector.select.options[0].label,'Pequeño');
 assert.equal(translate('My custom car name','en'),'My custom car name');
});

test('starter templates are generic, localised and independent',async()=>{
 const {templateBlocks}=await import('../src/core.js');
 for(const kind of ['electric','combustion','expenses','tyres']){
  const first=templateBlocks(kind,'en'),second=templateBlocks(kind,'es');
  assert.ok(first.length);assert.notEqual(first[0].id,second[0].id);
  assert.doesNotMatch(JSON.stringify(first),/xpeng|135818|sergey08/i);
  const fields=first.flatMap(b=>[...(b.fields??[]),...(b.prices??[]),...(b.groups??[]).flatMap(g=>g.fields)]);
  assert.ok(fields.every(f=>f.entity===''));
 }
 assert.equal(templateBlocks('electric','en')[0].fields[1].name,'Battery');
 assert.equal(templateBlocks('electric','es')[0].fields[1].name,'Batería');
});

test('new locale catalogues cover every interface key and recognise regional codes',async()=>{
 const {missingTranslations}=await import('../src/i18n.js');
 for(const code of ['fr','pt','de','it','nl'])assert.deepEqual(missingTranslations(code),[]);
 assert.equal(language({}, {language:'fr-FR'}),'fr');
 assert.equal(language({}, {language:'pt_BR'}),'pt');
 assert.equal(language({language:'ja'}, {language:'es'}),'en');
 assert.equal(translate('Potencia de carga','fr'),'Puissance de charge');
 assert.equal(translate('Conectado · Sin carga','pt'),'Ligado · Sem carregamento');
 assert.equal(format(1234.5,1,'fr'),new Intl.NumberFormat('fr',{minimumFractionDigits:1,maximumFractionDigits:1}).format(1234.5));
 assert.equal(translate('My custom car name','pt'),'My custom car name');
});

test('language selector explicitly requests a compact Home Assistant dropdown',async()=>{
 const {readFile}=await import('node:fs/promises');
 const editor=await readFile(new URL('../src/editor.js',import.meta.url),'utf8');
 assert.match(editor,/name:'language',selector:\{select:\{mode:'dropdown'/);
});
