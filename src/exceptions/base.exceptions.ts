export abstract class BaseException extends Error {
  private readonly _data: Record<string, string[]> = {};

  protected constructor(message: string) {
    super(message);
  }

  public get responseData(): Record<string, string[]> {
    return this._data;
  }

  public withData(key: string, value: string): this {
    (this._data[key] ??= []).push(value);
    return this;
  }

  public override toString(): string {
    const base = `${this.name}: ${this.message}`;
    const entries = Object.entries(this._data);
    if (entries.length === 0) {
      return base;
    }

    const formatted = entries
      .map(
        ([key, values]) =>
          `\n  ${key} = [${values.map((v) => JSON.stringify(v)).join(", ")}]`
      )
      .join("");

    return `${base}\nData:${formatted}`;
  }
}
