import { module, test } from 'qunit'
import { setupTest } from 'ember-qunit'

module('Unit | Adapter | build', function(hooks) {
  setupTest(hooks)

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let adapter = this.owner.lookup('adapter:build')
    assert.ok(adapter)
  })
})
