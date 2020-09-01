import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import hbs from 'htmlbars-inline-precompile'

module('Integration | Component | collapsible-container', function(hooks) {
  setupRenderingTest(hooks)

  test('it renders a default title', async function(assert) {
    await render(hbs`{{collapsible-container class="test"}}`)

    let component = this.element.querySelector('.test')
    assert.ok(component.classList.contains('collapsible'))
    assert.ok(component.classList.contains('collapsed'))

    let title = this.element.querySelector('.collapsible-title')
    assert.equal(title.querySelector('.collapsible-caret').textContent, '►')
    assert.equal(title.innerText, '► Collapsible')
  })

  test('it can have a custom title', async function(assert) {
    await render(hbs`{{collapsible-container class="test" title="My title"}}`)

    let title = this.element.querySelector('.collapsible-title')
    assert.equal(title.innerText, '► My title')
  })

  test('it yields to a collapsible content', async function(assert) {
    await render(hbs`
      {{#collapsible-container class="test"}}
      CONTENT
      {{/collapsible-container}}
    `)

    let title = this.element.querySelector('.collapsible-content')
    assert.equal(title.innerText.trim(), 'CONTENT')
  })

  // TODO TBC...
})
