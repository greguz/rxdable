import { OperatorFunction } from "rxjs";

import { Tranxform } from "./Tranxform";

export function getTransformByOperator<A, B>(operator: OperatorFunction<A, B>) {
  return new Tranxform(operator);
}
