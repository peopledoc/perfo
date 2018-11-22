import { module, test } from 'qunit'
import { setupTest } from 'ember-qunit'

module('Unit | Route | project-branch', function(hooks) {
  setupTest(hooks)

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:project-branch')
    assert.ok(route)
  })
})
