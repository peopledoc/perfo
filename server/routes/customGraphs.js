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
    formatter: payload.formatter,
    graphType: payload.graphType
  }
}

function keyFor(project) {
  return `custom-graphs/${project}`
}

module.exports = function(injections, app, routePrefix) {
  let {
    asyncHandler,
    store: { getItem, setItem },
    ci
  } = injections

  app.get(
    `${routePrefix}`,
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
    `${routePrefix}`,
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
    `${routePrefix}/:id`,
    asyncHandler(async(req, res) => {
      let key = keyFor(req.params.project)
      let id = Number(req.params.id)
      let data = (await getItem(key)) || { seq: 0, graphs: [] }
      let index = data.graphs.findIndex((graph) => graph.id === Number(id))

      if (index === -1) {
        res.sendStatus(404)
      } else {
        data.graphs.splice(index, 1)
        await setItem(key, data)

        res.sendStatus(204)
      }
    })
  )

  app.patch(
    `${routePrefix}/:id`,
    asyncHandler(async(req, res) => {
      let key = keyFor(req.params.project)
      let id = Number(req.params.id)
      let data = (await getItem(key)) || { seq: 0, graphs: [] }
      let index = data.graphs.findIndex((graph) => graph.id === Number(id))

      if (index === -1) {
        res.sendStatus(404)
      } else {
        let graph = data.graphs[index]
        data.graphs[index] = createCustomGraph(
          id,
          Object.assign(graph, req.body)
        )
        await setItem(key, data)

        res.json(
          Object.assign(data.graphs[index], { project: req.params.project })
        )
      }
    })
  )

  app.get(
    `${routePrefix}/:id/:branch`,
    asyncHandler(async(req, res) => {
      let { project, id, branch } = req.params
      let data = (await getItem(keyFor(project))) || { seq: 0, graphs: [] }
      let graph = data.graphs.find((g) => g.id === Number(id))

      if (!graph) {
        res.sendStatus(404)
      } else {
        res.json(await ci.customGraphData(project, branch, graph))
      }
    })
  )
}
