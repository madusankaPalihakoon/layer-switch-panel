import { Injectable } from '@angular/core';
import * as turf from '@turf/turf';
import LineString from 'ol/geom/LineString';
import { Polygon } from 'ol/geom';
import GeoJSON from 'ol/format/GeoJSON';
import { GeometryUtilsService } from '../geometry-utils.service';
import { Position } from 'geojson';

type Coordinate = [number, number];
// type Position = [number, number]; // Define Position type
@Injectable({
  providedIn: 'root',
})
export class CutPolygonService {
  private selectedPolygonEdges: any[] = [];
  private splitPolyGeoJSON!: GeoJSON.Polygon | null;
  private splitLineGeoJSON!: GeoJSON.LineString | null;

  private poly_1: any = [];
  private poly_2: any = [];

  private fisrtIntersectionEdgeID: number | undefined | null;
  private secondIntersectionEdgeID: number | undefined | null;
  private turfIntersectionPoint1: Position | null = null;
  private turfIntersectionPoint2: Position | null = null;
  private lineSegmentPoints: any = [];
  private lineSegmentPt :any =[]

  constructor(private geometryUtilsService: GeometryUtilsService) {}

  // ! ________________________________________________________________________
  // ! *******The Split Operation function under Cutpolygon Services ***********
  // !__________________________________________________________________________
  splitOperation(
    splitLine: LineString,
    splitPoly: Polygon | null
  ): { poly_01: Coordinate[]; poly_02: Coordinate[] } {
    //? Converting the openLayer features into GeoJSON objects

    this.splitPolyGeoJSON = {
      // this will ensure that geoJSON objects are are not null
      type: 'Polygon',
      coordinates: [],
    };

    this.splitLineGeoJSON = {
      // this will ensure that geoJSON objects are are not null
      type: 'LineString',
      coordinates: [],
    };

    const format = new GeoJSON();
    if (splitPoly) {
      this.splitPolyGeoJSON = format.writeGeometryObject(
        splitPoly
      ) as GeoJSON.Polygon;
    } else {
      console.log('Invalid splitPoly');
    }
    if (splitLine) {
      this.splitLineGeoJSON = format.writeGeometryObject(
        splitLine
      ) as GeoJSON.LineString;
    } else {
      console.log('Invalid splitLine');
    }

    //? ************ Create Array of Polygon Edges ********************************

    if (this.splitPolyGeoJSON) {
      // if state 1
      this.splitPolyGeoJSON.coordinates.forEach(
        (ring: any[], ringIndex: number) => {
          // Only process the outer ring, skip if ringIndex > 0 (inner rings)
          if (ringIndex === 0) {
            // if the point ID 0 //  if state 1.1
            // Iterate through each pair of coordinates in the outer ring
            const x = ring.length;
            for (let i = 0; i < ring.length - 1; i++) {
              // beging for statement
              const edge: GeoJSON.Feature<GeoJSON.LineString> = turf.lineString(
                [ring[i], ring[i + 1]]
              );

              // Assigning UID to each line string

              this.selectedPolygonEdges.push({ edge, id: i });
            }
          } // end if sate 1.1
        }
      );
    } // end if sate 1

    //? Find  the intersection  coordinates
    if (this.splitLineGeoJSON && this.splitPolyGeoJSON) {
      // if both plogon and linestring geojson filr exiist{
      const intersection = turf.lineIntersect(
        this.splitLineGeoJSON,

        this.splitPolyGeoJSON
      ); // find the intersection between line and the pollygon
      if (intersection.features.length >= 2) {
        this.turfIntersectionPoint1 =
          intersection.features[0].geometry.coordinates;
        this.turfIntersectionPoint2 =
          intersection.features[1].geometry.coordinates;
        const s = 1;
      } else {
        console.log('line is not intersect the polygon');
      }
    }
    //? Define the Polygon Edges that intersect the line and order them

    const result = this.geometryUtilsService.lineIntersectionEdgeID(
      this.selectedPolygonEdges,
      this.turfIntersectionPoint1,
      this.turfIntersectionPoint2
    );
    this.fisrtIntersectionEdgeID = result.fisrtIntersectionEdgeID;
    this.turfIntersectionPoint1 = result.turfIntersectionPoint1;
    this.secondIntersectionEdgeID = result.secondIntersectionEdgeID;
    this.turfIntersectionPoint2 = result.turfIntersectionPoint2;

    //? Generate the Line Segment Coordinates

    if (this.turfIntersectionPoint1 && this.turfIntersectionPoint2) {
      // if both plogon and linestring geojson filr exiist
      
      this.lineSegmentPoints = this.geometryUtilsService.generateLineSegment(
        this.turfIntersectionPoint1,
        this.turfIntersectionPoint2,
        this.splitLineGeoJSON,
        this.lineSegmentPt
      );
    } else {
      console.log('line is not intersect the polygon');
    }

    //?
    //? ************************* Generate Cutting Polygon Methode********************************
    //?

    //$ Case 01 if the both points are not in the same edge

    if (
      this.fisrtIntersectionEdgeID !== null &&
      this.secondIntersectionEdgeID !== null &&
      this.fisrtIntersectionEdgeID !== this.secondIntersectionEdgeID
    ) {
      // @ ******* defeine the first Polygon *******************
      this.poly_1.length = 0;
      //- push first coordinates of the fiest intersection edge into the polygon
      this.geometryUtilsService.pushPolyPoint(
        this.poly_1,
        0,
        this.fisrtIntersectionEdgeID!,
        this.selectedPolygonEdges
      );
      //- get the line segment coordinates and push into the polygon
      this.geometryUtilsService.pushLineCordstoPoly(
        this.poly_1,
        this.lineSegmentPoints
      );

      //-push the ponts into the poly start from the second intersection edge ID to first intersection edge ID.
      this.geometryUtilsService.generatePoly1(
        this.poly_1,
        this.selectedPolygonEdges,
        this.fisrtIntersectionEdgeID,
        this.secondIntersectionEdgeID
      );

      // @ ********  defeine the second polygon *******************
      this.poly_2.length = 0;
      //- push second coordinates of the fiest intersection edge into the polygon
      this.geometryUtilsService.pushPolyPoint(
        this.poly_2,
        1,
        this.fisrtIntersectionEdgeID,
        this.selectedPolygonEdges

      );
      //- get the line segment coordinates and push into the polygon
      this.geometryUtilsService.pushLineCordstoPoly(
        this.poly_2,
        this.lineSegmentPoints
      );

      //-push the ponts into the poly start from the second intersection edge ID to first intersection edge ID.
      this.geometryUtilsService.generatePoly2(
        this.poly_2,
        this.selectedPolygonEdges,
        this.fisrtIntersectionEdgeID,
        this.secondIntersectionEdgeID
      );
      console.log('this.generatePoly2');
    } else {
      //$ Case 02: If the both intersection points are on the same line

      // @ defeine the first Polygon

      //- push first coordinates of the fiest intersection edge into the polygon
      this.geometryUtilsService.pushPolyPoint(this.poly_1, 0, this.fisrtIntersectionEdgeID!, this.selectedPolygonEdges);
      //- get the line segment coordinates and push into the polygon
      this.geometryUtilsService.pushLineCordstoPoly(
        this.poly_1,
        this.lineSegmentPoints
      );

      //-push the ponts into the poly start from the second intersection edge ID to first intersection edge ID.

      this.generatePoly1(this.poly_1);

      //@ Defeine the Second poly

      this.geometryUtilsService.pushLineCordstoPoly(
        this.poly_2,
        this.lineSegmentPoints
      );
      this.poly_2.push(this.lineSegmentPoints[0]);
    } // finish the computation

    return {
      poly_01: this.poly_1,
      poly_02: this.poly_2,
    };
  } //@ end of the splitOperation

  //? The fucntions assocated with the class

  //$ Function define the intersection edges and points

  lineIntersectionEdgeID() {
    // Initialize intersection edge IDs as null or another invalid value to indicate not found
    let intersectionEdgeA: number | null = null;
    let intersectionEdgeB: number | null = null;
    let intersectionPointA: Position | null = null;
    let intersectionPointB: Position | null = null;

    // need to define functions to  each component

    for (let i = 0; i < this.selectedPolygonEdges.length; i++) {
      //+ Loop through edges
      // get the first intersection edge index
      let currentEdge = this.selectedPolygonEdges[i].edge;
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
        console.error(
          `lineCoordinates is undefined at index ${i}`,
          currentEdge
        );
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
        this.geometryUtilsService.isEffectivelyOnLine(
          this.turfIntersectionPoint1!,
          currentEdge
        );
      let isIntersectionPoint_BonEdge =
        this.geometryUtilsService.isEffectivelyOnLine(
          this.turfIntersectionPoint2!,
          currentEdge
        );

      // get the first intersection edge index
      if (isIntersectionPoint_AOnEdge && intersectionEdgeA === null) {
        intersectionEdgeA = i; // get the index of the first intersection edge
        intersectionPointA = this.turfIntersectionPoint1;
      } else {
        if (isIntersectionPoint_BonEdge && intersectionEdgeB === null) {
          // Check if the second intersection hasn't been found yet
          intersectionEdgeB = i; // Save the index of the second intersection edge
          intersectionPointB = this.turfIntersectionPoint2;
        } else {
          // If both intersections are found, no need to continue looping
          if (isIntersectionPoint_AOnEdge && isIntersectionPoint_BonEdge) {
            intersectionEdgeA = i; // get the index of the first intersection edge
            intersectionEdgeB = i; // Save the index of the second intersection edge
            intersectionPointA = this.turfIntersectionPoint1;
            intersectionPointB = this.turfIntersectionPoint2;
            this.fisrtIntersectionEdgeID = intersectionEdgeA;
            this.turfIntersectionPoint1 = intersectionPointA!;
            this.secondIntersectionEdgeID = intersectionEdgeB;
            this.turfIntersectionPoint2 = intersectionPointB!;

            break;
          }
        }
      }
    }

    if (intersectionEdgeA !== null && intersectionEdgeB !== null) {
      if (intersectionEdgeA < intersectionEdgeB) {
        this.fisrtIntersectionEdgeID = intersectionEdgeA;
        this.turfIntersectionPoint1 = intersectionPointA!;
        this.secondIntersectionEdgeID = intersectionEdgeB;
        this.turfIntersectionPoint2 = intersectionPointB!;
      } else if (intersectionEdgeA > intersectionEdgeB) {
        this.fisrtIntersectionEdgeID = intersectionEdgeB;
        this.turfIntersectionPoint1 = intersectionPointB!;
        this.secondIntersectionEdgeID = intersectionEdgeA;
        this.turfIntersectionPoint2 = intersectionPointA!;
      }
    }
  }
  //-End of the fucntion lineIntersectionID;

  //$ Function:  Push the points into the Poly

  pushPolyPoint(poly: any = [], pointID: 0 | 1, EdgeID: number) {
    const intersectionEdgeID = EdgeID;
    const intersectionEdge: GeoJSON.Feature<GeoJSON.Geometry> =
      this.selectedPolygonEdges[intersectionEdgeID!].edge;
    if (intersectionEdge.geometry.type === 'LineString') {
      let intersectionEdgeCoordinates = (
        intersectionEdge.geometry as GeoJSON.LineString
      ).coordinates[pointID];
      poly.push(intersectionEdgeCoordinates);
    }
  } //-end of pushPoint function

  //$ Funcition: Push line segment coordinates into ploly

  pushLineCordstoPoly(poly: any = [], lineCord: Position[]) {
    for (let i = 0; i < lineCord.length; i++) {
      poly.push(lineCord[i]);
    }
  } //-end of pushLineSegment function

  //$ Function: Generare Polygon 01
  generatePoly1(poly: any = []) {
    // - Fet the requred data for get the points of the polygon from the second intersection point.

    let lastEdgeID = this.selectedPolygonEdges.length - 1;
    let firstIntEdgeID = this.fisrtIntersectionEdgeID;
    let secondIntEdgeID = this.secondIntersectionEdgeID;

    this.pushPolyPoint(poly, 1, secondIntEdgeID!);

    if (secondIntEdgeID !== null && firstIntEdgeID !== null) {
      let currentEdgeID = secondIntEdgeID! + 1; // defeine the next edge  of the polygon

      if (currentEdgeID <= lastEdgeID) {
        // check whether the current edge is the last edge of the polygon
        while (currentEdgeID >= firstIntEdgeID!) {
          // do the itteration till meet the first edge of the polygon

          if (currentEdgeID === lastEdgeID) {
            // if the current edge is the last edge of the polygon

            this.pushPolyPoint(poly, 1, currentEdgeID); //push the second coordinate of the current edge to the polygon 01

            if (
              this.fisrtIntersectionEdgeID &&
              this.fisrtIntersectionEdgeID > 0
            ) {
              //get all the points from the first edge till the fist intesection edge
              for (let i = 0; i < this.fisrtIntersectionEdgeID; i++) {
                this.pushPolyPoint(poly, 1, i);
              }
              break; // end of the getting all the required points for the polygon 1
            } else {
              // if the case where first intersection point is on the first edge
              // do nothing
            }
            break;
          } else {
            this.pushPolyPoint(poly, 1, currentEdgeID); // push the current edge seconf point to the polygon 1
          }
          currentEdgeID = currentEdgeID + 1;
        }
      } else {
        // this can happen when the second intersection point is on the last edge
        this.pushPolyPoint(poly, 1, lastEdgeID);
        if (this.fisrtIntersectionEdgeID && this.fisrtIntersectionEdgeID > 0) {
          // if the first intersection point is not on the first edge this will execute
          for (let i = 0; i < this.fisrtIntersectionEdgeID; i++) {
            this.pushPolyPoint(poly, 1, i); //push all the points of the vertex of the polygon into the polygon1
          }
        } else {
          // if the case where first intersection point is on the first edge
          // do nothing
        }
      }
    }
  }

  //$ Function: Generare Polygon 02
  generatePoly2(poly: any = []) {
    // -get the requred data from the exisiting information to defeine the polygon
    let lastEdgeID = this.selectedPolygonEdges.length - 1;
    let firstIntEdgeID = this.fisrtIntersectionEdgeID;
    let secondIntEdgeID = this.secondIntersectionEdgeID;

    //get the first coordinates of the of the second edge and push into the polygon 2 array.
    this.pushPolyPoint(poly, 0, secondIntEdgeID!);

    //get the previoous edge ID
    let currentEdgeID = secondIntEdgeID! - 1;

    if (firstIntEdgeID) {
      while (currentEdgeID > firstIntEdgeID) {
        this.pushPolyPoint(poly, 0, currentEdgeID);
        currentEdgeID--;
      }
    }
  }

  //$ Functiion : Generata line string array
  generateLineSegment(
    startPoint: Position,
    endPoint: Position,
    lineString: GeoJSON.LineString
  ) {
    this.lineSegmentPoints.length = 0;
    let startFound = false;
    let endFound = false;
    const formatter = new GeoJSON();
    // const olLineString = formatter.readGeometry(lineString) as LineString;

    const firstLineSegment = this.lineSegment(0, lineString);
    const firstOLineSegment = formatter.readGeometry(
      firstLineSegment
    ) as LineString; // convert OL line string
    const isStartPointOnFirstLineSegment =
      this.geometryUtilsService.isEffectivelyOnLine(
        startPoint,
        firstOLineSegment
      );
    const isEndPointOnFirstLineSegment =
      this.geometryUtilsService.isEffectivelyOnLine(
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

        const isStartPointOnLine =
          this.geometryUtilsService.isEffectivelyOnLine(
            startPoint,
            segmentGeoJSON
          );
        const isEndPointOnLine = this.geometryUtilsService.isEffectivelyOnLine(
          endPoint,
          segmentGeoJSON
        );

        if (isStartPointOnLine && endFound === false && startFound === false) {
          this.lineSegmentPoints.push(stratPointCord);
          this.lineSegmentPoints.push(segmentEnd);
          startFound = true;
        } else {
          if (
            startFound === true &&
            endFound === false &&
            isEndPointOnLine == false
          ) {
            this.lineSegmentPoints.push(segmentEnd);
          } else {
            if (startFound && endFound === false && isEndPointOnLine === true) {
              this.lineSegmentPoints.push(endPointCord);
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
          const isStartPointOnLine =
            this.geometryUtilsService.isEffectivelyOnLine(
              startPoint,
              segmentGeoJSON
            );
          const isEndPointOnLine =
            this.geometryUtilsService.isEffectivelyOnLine(
              endPoint,
              segmentGeoJSON
            );

          if (isEndPointOnLine && endFound == false && startFound == false) {
            this.lineSegmentPoints.push(endPointCord);
            this.lineSegmentPoints.push(segmentEnd);
            endFound = true;
          }

          if (
            endFound == true &&
            startFound == false &&
            isStartPointOnLine == false &&
            isEndPointOnLine == false
          ) {
            this.lineSegmentPoints.push(segmentEnd);
          }

          if (endFound && startFound == false && isStartPointOnLine == true) {
            this.lineSegmentPoints.push(stratPointCord);
            startFound = true;
            break; // Exit loop after end is found
          }
        }
        const reverseArray = this.lineSegmentPoints.reverse();
        this.lineSegmentPoints = reverseArray;
      } else {
        if (
          isStartPointOnFirstLineSegment &&
          isEndPointOnFirstLineSegment &&
          startFound === false &&
          endFound === false
        ) {
          const stratPointCord = startPoint;
          const endPointCord = endPoint;
          this.lineSegmentPoints.push(stratPointCord);
          this.lineSegmentPoints.push(endPointCord);
        }
      }
    }

    return this.lineSegmentPoints;
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

  //$Function: Check Point is effectively on line
  isEefectivelyOnLIne(
    pointFeature: Position,
    line: LineString,
    tolerance = 0.01
  ): boolean {
    const turfPoint = turf.point(pointFeature);

    if (!(line instanceof LineString)) {
      throw new Error(
        'The provided line is not an instance of ol.geom.LineString'
      );
    }

    const lineCoordinates = line.getCoordinates();
    const turfLine = turf.lineString(lineCoordinates);

    // const formatter = new GeoJSON();
    // const lineGeoJSON = formatter.writeGeometryObject(
    //   line
    // ) as GeoJSON.LineString;

    const distance = turf.pointToLineDistance(turfPoint, turfLine, {
      units: 'meters',
    });
    const c = 0;
    return distance < tolerance;
  } //-end of isEffectivelyOnLIne function
}
