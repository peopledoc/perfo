import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import hbs from 'htmlbars-inline-precompile'

module('Integration | Component | nav-bar', function(hooks) {
  setupRenderingTest(hooks)

  test('it renders', async function(assert) {
    this.set('mockNavigation', {
      isLoadingProjects: true
    })
    await render(hbs`{{nav-bar navigation=mockNavigation}}`)
    assert.ok(true, 'it renders')
  })
})
