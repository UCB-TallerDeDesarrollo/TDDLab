import { CommitDataObject } from "../../../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

export const mockCommitData: CommitDataObject = {
  html_url: "https://github.com/user2/repo2/commit/1234",
  sha: "123321456",
  stats: { total: 5, additions: 4, deletions: 1 },
  commit: {
    date: new Date("2023-10-07T09:45:00.000Z"),
    message: "Commit Mock commit message",
    url: "https://github.com/user2/repo2/commit/98765",
    comment_count: 2,
  },
  coverage: 80,
  test_count:2
};

export const mockArrayCommitData: CommitDataObject[] = [
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      comment_count: 1,
      message: "Todos los tests del mundo",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
    },
    coverage: 100,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
    sha: "dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
    stats: {
      total: 72,
      additions: 36,
      deletions: 36,
    },
    test_count:0
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      comment_count: 1,
      message: "mAS tests jajaj vamoo",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/bec3c0a1d89bda290f1a4adb9fde359654ce2401",
    },
    coverage: 91.38,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/bec3c0a1d89bda290f1a4adb9fde359654ce2401",
    sha: "bec3c0a1d89bda290f1a4adb9fde359654ce2401",
    stats: {
      total: 45,
      additions: 23,
      deletions: 22,
    },
    test_count:0
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      comment_count: 1,
      message: "MORE TESTS, SEND MORE TESTS",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/cad139e281dd7a0e983a217329cc6f307ec00fa6",
    },
    coverage: 87.93,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/cad139e281dd7a0e983a217329cc6f307ec00fa6",
    sha: "cad139e281dd7a0e983a217329cc6f307ec00fa6",
    stats: {
      total: 63,
      additions: 32,
      deletions: 31,
    },
    test_count:1
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      comment_count: 1,
      message: "Even more tests now",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/5ff717ba257ac052b45af77a6aadca2f6eadbab5",
    },
    coverage: 70.69,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/5ff717ba257ac052b45af77a6aadca2f6eadbab5",
    sha: "5ff717ba257ac052b45af77a6aadca2f6eadbab5",
    stats: {
      total: 0,
      additions: 0,
      deletions: 0,
    },
    test_count:2
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "More tests done",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/6e449e2b853254ff52a789fb024dc0972c114618",
      comment_count: 1,
    },
    coverage: 65.52,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/6e449e2b853254ff52a789fb024dc0972c114618",
    sha: "6e449e2b853254ff52a789fb024dc0972c114618",
    stats: {
      total: 80,
      additions: 40,
      deletions: 40,
    },
    test_count:4
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Did a lot of changes",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/525f18f86f03e78277e2d0355b4cde7f14933642",
      comment_count: 1,
    },
    coverage: 22.41,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/525f18f86f03e78277e2d0355b4cde7f14933642",
    sha: "525f18f86f03e78277e2d0355b4cde7f14933642",
    stats: {
      total: 1263,
      additions: 1232,
      deletions: 31,
    },
    test_count:10
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Update integrate.yml",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/e56e226490ed47f3129a64d8de885772e9995a9f",
      comment_count: 1,
    },
    coverage: 100,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/e56e226490ed47f3129a64d8de885772e9995a9f",
    sha: "e56e226490ed47f3129a64d8de885772e9995a9f",
    stats: {
      total: 2,
      additions: 1,
      deletions: 1,
    },
    test_count:12
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Update integrate.yml",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/7fe269f057942086fb1e8698d09f4e1100f1c5ff",
      comment_count: 1,
    },
    coverage: 100,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/7fe269f057942086fb1e8698d09f4e1100f1c5ff",
    sha: "0d1e0964873fbd9db2898ef06e5bed128078c876",
    stats: {
      total: 2,
      additions: 1,
      deletions: 1,
    },
    test_count:20
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Initial commit",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/0d5393ab957e86e391af660581785b319470096d",
      comment_count: 0,
    },
    coverage: 0,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/0d5393ab957e86e391af660581785b319470096d",
    sha: "0d5393ab957e86e391af660581785b319470096d",
    stats: {
      total: 18134,
      additions: 18134,
      deletions: 0,
    },
    test_count:21
  },
  {
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "This worked before",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/677b1f0c722b17daf8dd29a71a152fe16458fbc5",
      comment_count: 0,
    },
    coverage: 0,
    html_url:
      "https://github.com/FranAliss/parcel_jest_base_TDD/commit/677b1f0c722b17daf8dd29a71a152fe16458fbc5",
    sha: "677b1f0c722b17daf8dd29a71a152fe16458fbc5",
    stats: {
      total: 17,
      additions: 12,
      deletions: 5,
    },
    test_count:30
  },
];
