// eslint-disable-next-line @typescript-eslint/no-redeclare
export interface BigInt {
  /** Convert to BigInt to string form in JSON.stringify */
  toJSON: () => string;
}
// @ts-expect-error I Know What I'm Doing
BigInt.prototype.toJSON = function () {
  return this.toString();
};
