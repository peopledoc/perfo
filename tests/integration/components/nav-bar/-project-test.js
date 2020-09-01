import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import hbs from 'htmlbars-inline-precompile'

module('Integration | Component | nav-bar/-project', function(hooks) {
  setupRenderingTest(hooks)

  test('it renders', async function(assert) {
    this.set('project', { provider: 123 })
    this.set('mockNavigation', {
      providers: [{ id: 123, name: 'my provider', icon: 'wow.ico' }]
    })

    await render(hbs`{{nav-bar/-project navigation=mockNavigation project=project}}`)

    assert.equal(this.element.textContent.trim(), '')
  })
})
