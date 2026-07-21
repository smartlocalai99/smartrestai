import { describe, expect, it, vi } from "vitest";
import { createTrailingRefresh } from "@/lib/trailingRefresh.mjs";

const deferred = () => {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

describe("createTrailingRefresh", () => {
  it("coalesces overlapping calls into one trailing refresh", async () => {
    const first = deferred();
    const second = deferred();
    const task = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockResolvedValue(undefined);
    const refresh = createTrailingRefresh(task);

    const running = refresh();
    refresh();
    refresh();
    expect(task).toHaveBeenCalledTimes(1);

    first.resolve();
    await first.promise;
    await Promise.resolve();
    expect(task).toHaveBeenCalledTimes(2);

    second.resolve();
    await running;
    await refresh();
    expect(task).toHaveBeenCalledTimes(3);
  });
});
