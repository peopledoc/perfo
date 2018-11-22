import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import hbs from 'htmlbars-inline-precompile'

module('Integration | Component | custom-graph', function(hooks) {
  setupRenderingTest(hooks)

  test('it renders', async function(assert) {
    this.set('graph', { formatter: null })
    await render(hbs`{{custom-graph graph=graph}}`)
    assert.ok(true, 'it renders')
  })
})
