import { OperatorFunction } from "rxjs";

import { Tranxform } from "./Tranxform";

export function getStreamByOperator(
  ...operators: Array<OperatorFunction<any, any>>
) {
  return new Tranxform(...operators);
}
