import { OperatorFunction } from "rxjs";

import { Tranxform } from "./Tranxform";

export function getStreamByOperator<A, B>(
  ...operators: Array<OperatorFunction<A, B>>
) {
  return new Tranxform(...operators);
}
