import { module, test } from 'qunit'
import { setupRenderingTest } from 'ember-qunit'
import { render } from '@ember/test-helpers'
import { hbs } from 'ember-cli-htmlbars'

module('Integration | Component | custom-graph', function(hooks) {
  setupRenderingTest(hooks)

  test('it renders a loading state', async function(assert) {
    let mockStore = {
      query() {
        return new Promise(function() {})
      }
    }
    this.set('mockStore', mockStore)
    this.set('graph', { formatter: null })
    this.set('project', { id: 123, name: 'project name' })
    await render(hbs`{{custom-graph graph=graph project=project store=mockStore branch="branch_test"}}`)
    assert.dom(this.element).hasText(
      'Loading artifact data for project name on branch_test, this may take a little while...'
    )
  })

  test('it renders a graph', async function(assert) {
    let mockStore = {
      query() {
        return Promise.resolve({
          points: []
        })
      }
    }
    this.set('mockStore', mockStore)
    this.set('graph', { formatter: null })
    this.set('project', { id: 123, name: 'project name' })
    await render(hbs`{{custom-graph graph=graph project=project store=mockStore branch="branch_test"}}`)
    assert.ok(true)
  })
})
