import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import { Position } from 'geojson';
import LineString from 'ol/geom/LineString';
import GeoJSON from 'ol/format/GeoJSON';
import { Polygon } from 'ol/geom';

@Injectable({
  providedIn: 'root',
})
export class GeometryUtilsService {




  constructor() {}
 
  
  //$Function: Check Point is effectively on line
  isEffectivelyOnLine(
    pointFeature: Position,
    line: any,
    tolerance = 0.01
  ): boolean {
    let olLine: LineString;
    const turfPoint = turf.point(pointFeature);


    // Convert GeoJSON LineString to ol.geom.LineString if necessary
    if (line.type === 'Feature' && line.geometry.type === 'LineString') {
      const format = new GeoJSON();
      olLine = format.readGeometry(line.geometry) as LineString;
    } else if (line instanceof LineString) {
      olLine = line;
    } else {
      throw new Error('The provided line is not a valid LineString');
    }

 
    const lineCoordinates = olLine.getCoordinates();
    const turfLine = turf.lineString(lineCoordinates);

    const distance = turf.pointToLineDistance(turfPoint, turfLine, {
      units: 'meters',
    });

    return distance < tolerance;
  }
//? The fucntions assocated with the class

  //$ Function define the intersection edges and points -Corrected

  lineIntersectionEdgeID(selectedPolygonEdges: any=[], turfIntersectionPoint1:Position|null, turfIntersectionPoint2:Position|null) {
    // Initialize intersection edge IDs as null or another invalid value to indicate not found
    let intersectionEdgeA: number | null = null;
    let intersectionEdgeB: number | null = null;
    let intersectionPointA: Position | null = null;
    let intersectionPointB: Position | null = null;
    let fisrtIntersectionEdgeID:  number | null = null; 
    let secondIntersectionEdgeID: number | null = null;
          

    // need to define functions to  each component

    for (let i = 0; i < selectedPolygonEdges.length; i++) {
      //+ Loop through edges
      // get the first intersection edge index
      let currentEdge = selectedPolygonEdges[i].edge;
      let lineCoordinates: number[][] | undefined;

      // Ensure the edge is a GeoJSON feature and has LineString coordinates
      if (
        currentEdge &&
        currentEdge.type === 'Feature' &&
        currentEdge.geometry.type === 'LineString'
      ) {
        lineCoordinates = currentEdge.geometry.coordinates;
      } else {
        console.error(`Invalid edge at index ${i}`, currentEdge);
        continue;
      }
      // Check if lineCoordinates is defined
      if (!lineCoordinates) {
        console.error(`lineCoordinates is undefined at index ${i}`, currentEdge);
        continue;
      }


      // Create an instance of ol.geom.LineString
      let lineString: LineString;
      try {
        lineString = new LineString(lineCoordinates);
      } catch (error) {
        console.error(`Error creating LineString at index ${i}`, error);
        continue;
      }

      // Check if the first intersection point is on the current edge
      let isIntersectionPoint_AOnEdge =
        this.isEffectivelyOnLine(
          turfIntersectionPoint1!,
          currentEdge
        );
      let isIntersectionPoint_BonEdge =
        this.isEffectivelyOnLine(
          turfIntersectionPoint2!,
          currentEdge
        );

      // get the first intersection edge index
      if (isIntersectionPoint_AOnEdge && intersectionEdgeA === null) {
        intersectionEdgeA = i; // get the index of the first intersection edge
        intersectionPointA = turfIntersectionPoint1;
      } else {
        if (isIntersectionPoint_BonEdge && intersectionEdgeB === null) {
          // Check if the second intersection hasn't been found yet
          intersectionEdgeB = i; // Save the index of the second intersection edge
          intersectionPointB = turfIntersectionPoint2;
        } else {
          // If both intersections are found, no need to continue looping
          if (isIntersectionPoint_AOnEdge && isIntersectionPoint_BonEdge) {
            intersectionEdgeA = i; // get the index of the first intersection edge
            intersectionEdgeB = i; // Save the index of the second intersection edge
            intersectionPointA = turfIntersectionPoint1;
            intersectionPointB = turfIntersectionPoint2;
           fisrtIntersectionEdgeID = intersectionEdgeA;
            turfIntersectionPoint1 = intersectionPointA!;
            secondIntersectionEdgeID = intersectionEdgeB;
           turfIntersectionPoint2 = intersectionPointB!;

            break;
          }
        }
      }
    }

    if (intersectionEdgeA !== null && intersectionEdgeB !== null) {
      if (intersectionEdgeA < intersectionEdgeB) {
        fisrtIntersectionEdgeID = intersectionEdgeA;
        turfIntersectionPoint1 = intersectionPointA!;
        secondIntersectionEdgeID = intersectionEdgeB;
        turfIntersectionPoint2 = intersectionPointB!;
      } else if (intersectionEdgeA > intersectionEdgeB) {
        fisrtIntersectionEdgeID = intersectionEdgeB;
        turfIntersectionPoint1 = intersectionPointB!;
        secondIntersectionEdgeID = intersectionEdgeA;
        turfIntersectionPoint2 = intersectionPointA!;
      }
    }
    return {fisrtIntersectionEdgeID,turfIntersectionPoint1,secondIntersectionEdgeID,turfIntersectionPoint2  }

  }
  //-End of the fucntion lineIntersectionID;

  //$ Function:  Push the points into the Poly-corrected

  pushPolyPoint(poly: any = [], pointID: 0 | 1, EdgeID: number, selectedPolygonEdges:any[] = []) {
    const intersectionEdgeID = EdgeID;
    const intersectionEdge: GeoJSON.Feature<GeoJSON.Geometry> =
      selectedPolygonEdges[intersectionEdgeID!].edge;
    if (intersectionEdge.geometry.type === 'LineString') {
      let intersectionEdgeCoordinates = (
        intersectionEdge.geometry as GeoJSON.LineString
      ).coordinates[pointID];
      poly.push(intersectionEdgeCoordinates);
    }
  } //-end of pushPoint function

  //$ Funcition: Push line segment coordinates into ploly

  pushLineCordstoPoly(poly: any = [], lineSegmentPoints: Position[]) {
    for (let i = 0; i < lineSegmentPoints.length; i++) {
      poly.push(lineSegmentPoints[i]);
    }
  } //-end of pushLineSegment function

  //$ Function: Generare Polygon 01 -corrected
  generatePoly1(poly: any = [], selectedPolygonEdges:any =[],fisrtIntersectionEdgeID:number| undefined |null,secondIntersectionEdgeID:number  ) {
    // - Fet the requred data for get the points of the polygon from the second intersection point.

    let lastEdgeID = selectedPolygonEdges.length - 1;
    let firstIntEdgeID = fisrtIntersectionEdgeID;
    let secondIntEdgeID = secondIntersectionEdgeID;

    this.pushPolyPoint(poly, 1, secondIntEdgeID,selectedPolygonEdges);

    if (secondIntEdgeID !== null && firstIntEdgeID !== null) {
      let currentEdgeID = secondIntEdgeID! + 1; // defeine the next edge  of the polygon

      if (currentEdgeID <= lastEdgeID) {
        // check whether the current edge is the last edge of the polygon
        while (currentEdgeID >= firstIntEdgeID!) {
          // do the itteration till meet the first edge of the polygon

          if (currentEdgeID === lastEdgeID) {
            // if the current edge is the last edge of the polygon

            this.pushPolyPoint(poly, 1, currentEdgeID,selectedPolygonEdges ); //push the second coordinate of the current edge to the polygon 01

            if (
              fisrtIntersectionEdgeID &&
              fisrtIntersectionEdgeID > 0
            ) {
              //get all the points from the first edge till the fist intesection edge
              for (let i = 0; i < fisrtIntersectionEdgeID; i++) {
                this.pushPolyPoint(poly, 1, i,selectedPolygonEdges);
              }
              break; // end of the getting all the required points for the polygon 1
            } else {
              // if the case where first intersection point is on the first edge
              // do nothing
            }
            break;
          } else {
            this.pushPolyPoint(poly, 1, currentEdgeID,selectedPolygonEdges); // push the current edge seconf point to the polygon 1
          }
          currentEdgeID = currentEdgeID + 1;
        }
      } else {
        // this can happen when the second intersection point is on the last edge
        this.pushPolyPoint(poly, 1, lastEdgeID,selectedPolygonEdges);
        if (fisrtIntersectionEdgeID && fisrtIntersectionEdgeID > 0) {
          // if the first intersection point is not on the first edge this will execute
          for (let i = 0; i < fisrtIntersectionEdgeID; i++) {
            this.pushPolyPoint(poly, 1, i,selectedPolygonEdges); //push all the points of the vertex of the polygon into the polygon1
          }
        } else {
          // if the case where first intersection point is on the first edge
          // do nothing
        }
      }
    }
    return poly
  }

  //$ Function: Generare Polygon 02 - corrected
  generatePoly2(poly: any = [],selectedPolygonEdges:any =[],fisrtIntersectionEdgeID:number| undefined |null, secondIntersectionEdgeID:number| undefined |null) {
    // -get the requred data from the exisiting information to defeine the polygon
    let lastEdgeID = selectedPolygonEdges.length - 1;
    let firstIntEdgeID = fisrtIntersectionEdgeID;
    let secondIntEdgeID = secondIntersectionEdgeID;

    //get the first coordinates of the of the second edge and push into the polygon 2 array.
    this.pushPolyPoint(poly, 0, secondIntEdgeID!,selectedPolygonEdges );

    //get the previoous edge ID
    let currentEdgeID = secondIntEdgeID! - 1;

    if (firstIntEdgeID) {
      while (currentEdgeID > firstIntEdgeID) {
        this.pushPolyPoint(poly, 0, currentEdgeID,selectedPolygonEdges);
        currentEdgeID--;
      }
    }
  }

  //$ Functiion : Generata line string array
  generateLineSegment(
    startPoint: Position,
    endPoint: Position,
    lineString: GeoJSON.LineString,
    lineSegmentPt :any =[]
  ) {
    lineSegmentPt.length =0 ;
    let startFound = false;
    let endFound = false;
    const formatter = new GeoJSON();
    // const olLineString = formatter.readGeometry(lineString) as LineString;

    const firstLineSegment = this.lineSegment(0, lineString);
    const firstOLineSegment = formatter.readGeometry(
      firstLineSegment
    ) as LineString; // convert OL line string
    const isStartPointOnFirstLineSegment = this.isEffectivelyOnLine(
      startPoint,
      firstOLineSegment
    );
    const isEndPointOnFirstLineSegment = this.isEffectivelyOnLine(
      endPoint,
      firstOLineSegment
    );

    if (
      isStartPointOnFirstLineSegment &&
      isEndPointOnFirstLineSegment === false
    ) {
      for (let i = 0; i < lineString.coordinates.length - 1; i++) {
        const segmentStart = lineString.coordinates[i];
        const segmentEnd = lineString.coordinates[i + 1];
        const stratPointCord = startPoint;
        const endPointCord = endPoint;

        const segment = this.lineSegment(i, lineString);
        const segmentGeoJSON = formatter.readGeometry(segment) as LineString; // convert into ol line string

        const isStartPointOnLine = this.isEffectivelyOnLine(
          startPoint,
          segmentGeoJSON
        );
        const isEndPointOnLine = this.isEffectivelyOnLine(
          endPoint,
          segmentGeoJSON
        );

        if (isStartPointOnLine && endFound === false && startFound === false) {
          lineSegmentPt.push(stratPointCord);
         lineSegmentPt.push(segmentEnd);
          startFound = true;
        } else {
          if (
            startFound === true &&
            endFound === false &&
            isEndPointOnLine == false
          ) {
            lineSegmentPt.push(segmentEnd);
          } else {
            if (startFound && endFound === false && isEndPointOnLine === true) {
              lineSegmentPt.push(endPointCord);
              endFound = true;
              break; // Exit loop after end is found
            }
          }
        }
      }
    } else {
      if (
        isStartPointOnFirstLineSegment === false &&
        isEndPointOnFirstLineSegment
      ) {
        for (let i = 0; i < lineString.coordinates.length - 1; i++) {
          const segmentStart = lineString.coordinates[i];
          const segmentEnd = lineString.coordinates[i + 1];
          const stratPointCord = startPoint;
          const endPointCord = endPoint;

          const segment = this.lineSegment(i, lineString);
          const segmentGeoJSON = formatter.readGeometry(segment) as LineString;
          const isStartPointOnLine =this.isEffectivelyOnLine(
            startPoint,
            segmentGeoJSON
          );
          const isEndPointOnLine = this.isEffectivelyOnLine(
            endPoint,
            segmentGeoJSON
          );

          if (isEndPointOnLine && endFound == false && startFound == false) {
            lineSegmentPt.push(endPointCord);
            lineSegmentPt.push(segmentEnd);
            endFound = true;
          }

          if (
            endFound == true &&
            startFound == false &&
            isStartPointOnLine == false &&
            isEndPointOnLine == false
          ) {
            lineSegmentPt.push(segmentEnd);
          }

          if (endFound && startFound == false && isStartPointOnLine == true) {
            lineSegmentPt.push(stratPointCord);
            startFound = true;
            break; // Exit loop after end is found
          }
        }
        const reverseArray = lineSegmentPt.reverse();
        lineSegmentPt = reverseArray;
      } else {
        if (
          isStartPointOnFirstLineSegment &&
          isEndPointOnFirstLineSegment &&
          startFound === false &&
          endFound === false
        ) {
          const stratPointCord = startPoint;
          const endPointCord = endPoint;
          lineSegmentPt.push(stratPointCord);
          lineSegmentPt.push(endPointCord);
        }
      }
    }

    return lineSegmentPt;
  }

  //$ Function: Generrate line segment

  lineSegment(i: number, lineString: GeoJSON.LineString) {
    const segmentStart = lineString.coordinates[i];
    const segmentEnd = lineString.coordinates[i + 1];
    const segment = new LineString([segmentStart, segmentEnd]);
    const formatter = new GeoJSON();
    const segmentGeoJSON = formatter.writeGeometryObject(segment);
    return segmentGeoJSON as GeoJSON.LineString;
  }





}
