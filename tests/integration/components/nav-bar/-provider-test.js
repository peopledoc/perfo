import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import hbs from 'htmlbars-inline-precompile'

module('Integration | Component | nav-bar/-provider', function(hooks) {
  setupRenderingTest(hooks)

  test('it renders', async function(assert) {
    this.set('provider', {
      name: 'provider name'
    })

    await render(hbs`{{nav-bar/-provider provider=provider}}`)

    assert.dom(this.element).hasText('provider name')
  })
})
