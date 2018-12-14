/* eslint-env node */
'use strict'

function createCustomGraph(id, payload) {
  return {
    id,
    title: payload.title,
    jobName: payload.jobName,
    artifactMatches: payload.artifactMatches,
    branchMatches: payload.branchMatches,
    order: payload.order,
    showLegend: !!payload.showLegend,
    formatter: payload.formatter
  }
}

module.exports = function(injections, app, routePrefix) {
  let {
    asyncHandler,
    store: { getItem, setItem }
  } = injections

  app.get(
    `${routePrefix}/:project`,
    asyncHandler(async(req, res) => {
      let key = `projects/${req.params.project}/custom-graphs`
      let data = (await getItem(key)) || { seq: 0, graphs: [] }

      res.json(data.graphs)
    })
  )

  app.post(
    `${routePrefix}/:project`,
    asyncHandler(async(req, res) => {
      let key = `projects/${req.params.project}/custom-graphs`
      let data = (await getItem(key)) || { seq: 0, graphs: [] }
      let graph = createCustomGraph(data.seq + 1, req.body)
      data.seq = data.seq + 1

      data.graphs.push(graph)
      await setItem(key, data)

      res
        .status(201)
        .json(Object.assign(graph, { project: req.params.project }))
    })
  )

  app.delete(
    `${routePrefix}/:project/:index`,
    asyncHandler(async(req, res) => {
      let key = `projects/${req.params.project}/custom-graphs`
      let index = Number(req.params.index)
      let graphs = (await getItem(key)) || []

      if (!graphs[index]) {
        res.sendStatus(404)
      } else {
        graphs.splice(index, 1)
        await setItem(key, graphs)

        res.sendStatus(201)
      }
    })
  )

  app.patch(
    `${routePrefix}/:project/:index`,
    asyncHandler(async(req, res) => {
      let key = `projects/${req.params.project}/custom-graphs`
      let index = Number(req.params.index)
      let graphs = (await getItem(key)) || []
      let graph = graphs[index]

      if (!graph) {
        res.sendStatus(404)
      } else {
        graphs[index] = createCustomGraph(
          graph.project,
          Object.assign(graph, req.body)
        )
        await setItem(key, graphs)

        res.json(graph)
      }
    })
  )
}
