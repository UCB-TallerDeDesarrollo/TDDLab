import {
  isSafariBrowser,
  shouldShowSafariCookieWarning,
} from "../../../src/presentation/assignments/services/assignmentsScreenService";

describe("assignmentsScreenService Safari cookie warning", () => {
  it("detects Safari without matching Chrome or Firefox on iOS", () => {
    expect(
      isSafariBrowser(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        "Apple Computer, Inc.",
      ),
    ).toBe(true);

    expect(
      isSafariBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/117.0 Mobile/15E148 Safari/604.1",
        "Google Inc.",
      ),
    ).toBe(false);

    expect(
      isSafariBrowser(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/118.0 Mobile/15E148 Safari/605.1.15",
        "Mozilla",
      ),
    ).toBe(false);
  });

  it("shows the warning only for authenticated Safari users with no groups after loading", () => {
    expect(
      shouldShowSafariCookieWarning({
        groupCount: 0,
        isAuthenticated: true,
        isLoading: false,
        isSafari: true,
      }),
    ).toBe(true);

    expect(
      shouldShowSafariCookieWarning({
        groupCount: 1,
        isAuthenticated: true,
        isLoading: false,
        isSafari: true,
      }),
    ).toBe(false);

    expect(
      shouldShowSafariCookieWarning({
        groupCount: 0,
        isAuthenticated: true,
        isLoading: false,
        isSafari: false,
      }),
    ).toBe(false);
  });
});
