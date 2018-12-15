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

function keyFor(project) {
  return `custom-graphs/${project}`
}

module.exports = function(injections, app, routePrefix) {
  let {
    asyncHandler,
    store: { getItem, setItem }
  } = injections

  app.get(
    `${routePrefix}/:project`,
    asyncHandler(async(req, res) => {
      let key = keyFor(req.params.project)
      let data = (await getItem(key)) || { seq: 0, graphs: [] }

      res.json(
        data.graphs.map((graph) =>
          Object.assign(graph, { project: req.params.project })
        )
      )
    })
  )

  app.post(
    `${routePrefix}/:project`,
    asyncHandler(async(req, res) => {
      let key = keyFor(req.params.project)
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
    `${routePrefix}/:project/:id`,
    asyncHandler(async(req, res) => {
      let key = keyFor(req.params.project)
      let id = Number(req.params.id)
      let graphs = (await getItem(key)) || []
      let index = graphs.findIndex((graph) => graph.id === id)

      if (index === -1) {
        res.sendStatus(404)
      } else {
        graphs.splice(index, 1)
        await setItem(key, graphs)

        res.sendStatus(201)
      }
    })
  )

  app.patch(
    `${routePrefix}/:project/:id`,
    asyncHandler(async(req, res) => {
      let key = keyFor(req.params.project)
      let id = Number(req.params.id)
      let graphs = (await getItem(key)) || []
      let index = graphs.findIndex((graph) => graph.id === id)

      if (index === -1) {
        res.sendStatus(404)
      } else {
        let graph = graphs[index]
        graphs[index] = createCustomGraph(id, Object.assign(graph, req.body))
        await setItem(key, graphs)

        res.json(Object.assign(graphs[index], { project: req.params.project }))
      }
    })
  )
}
