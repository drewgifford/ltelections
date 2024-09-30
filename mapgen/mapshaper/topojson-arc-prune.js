import TopoJSON from "./topojson.js";
import utils from './utils.js';

export function pruneArcs(topology) {
    var arcs = topology.arcs;
    var retained = new Uint32Array(arcs.length);
  
    utils.forEachProperty(topology.objects, function(obj) {
      TopoJSON.forEachArc(obj, function(arcId) {
        // TODO: skip collapsed arcs
        if (arcId < 0) arcId = ~arcId;
        retained[arcId] = 1;
      });
    });
  
    if (utils.sum(retained) < arcs.length) {
      // filter arcs and remap ids
      topology.arcs = arcs.reduce(function(arcs, arc, i) {
        if (arc && retained[i] === 1) { // dissolved-away arcs are set to null
          retained[i] = arcs.length;
          arcs.push(arc);
        } else {
          retained[i] = -1;
        }
        return arcs;
      }, []);
  
      // Re-index
      utils.forEachProperty(topology.objects, function(obj) {
        reindexArcIds(obj, retained);
      });
    }

    return topology;
  }
  
  // @map is an array of replacement arc ids, indexed by original arc id
  // @geom is a TopoJSON Geometry object (including GeometryCollections, Polygons, etc)
  function reindexArcIds(geom, map) {
    TopoJSON.forEachArc(geom, function(id) {
      var rev = id < 0,
          idx = rev ? ~id : id,
          replacement = map[idx];
      if (replacement < 0) { // -1 in arc map indicates arc has been removed
        error("[reindexArcIds()] invalid arc id");
      }
      return rev ? ~replacement : replacement;
    });
  }