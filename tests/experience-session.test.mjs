import test from 'node:test';
import assert from 'node:assert/strict';
import { returnDestination } from '../public/experience/js/session.js';

test('login returns to the requested experience page with project context',()=>{
  for(const prefix of ['', '/preview']) {
    const base=`https://example.com${prefix}/experience/login.html`;
    assert.equal(returnDestination('dashboard.html?project=p1',base),`https://example.com${prefix}/experience/dashboard.html?project=p1`);
  }
});
test('login rejects external and out-of-workspace redirect targets',()=>{
  const base='https://example.com/preview/experience/login.html';
  for(const target of ['https://attacker.invalid/projects.html','//attacker.invalid/projects.html','javascript:alert(1)','../projects.html','/projects.html','login.html','missing.html']) {
    assert.equal(returnDestination(target,base),'https://example.com/preview/experience/projects.html');
  }
});
