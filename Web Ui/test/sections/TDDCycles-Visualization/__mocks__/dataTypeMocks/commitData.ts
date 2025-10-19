// Definición de la interfaz estándar de commit
export interface CommitData {
  sha: string;
  author?: string;
  commit: {
    date: Date;
    message: string;
    url: string;
    comment_count?: number;
  };
  stats: {
    total: number;
    additions: number;
    deletions: number;
    date?: string;
  };
  coverage: number;
  test_count: number;
  conclusion: "success" | "failure";
  html_url?: string;
}

// Mock de un solo dato
export const mockCommitData: CommitData = {
  sha: "123321456",
  author: "Developer1",
  commit: {
    date: new Date("2023-10-07T09:45:00.000Z"),
    message: "Commit Mock commit message",
    url: "https://github.com/user2/repo2/commit/98765",
    comment_count: 2,
  },
  stats: {
    total: 5,
    additions: 4,
    deletions: 1,
    date: "2023-10-07",
  },
  coverage: 80,
  test_count: 2,
  conclusion: "success",
  html_url: "https://github.com/user2/repo2/commit/1234",
};

// Array de commits en formato estándar
export const mockCommitDataArray: CommitData[] = [
  {
    sha: "dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Todos los tests del mundo",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
      comment_count: 1,
    },
    stats: {
      total: 72,
      additions: 36,
      deletions: 36,
      date: "2023-10-07",
    },
    coverage: 100,
    test_count: 0,
    conclusion: "success",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/dd4ca82ccf990f55ecc1ea94c75d114ea05a39ff",
  },
  {
    sha: "bec3c0a1d89bda290f1a4adb9fde359654ce2401",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "mAS tests jajaj vamoo",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/bec3c0a1d89bda290f1a4adb9fde359654ce2401",
      comment_count: 1,
    },
    stats: {
      total: 45,
      additions: 23,
      deletions: 22,
      date: "2023-10-07",
    },
    coverage: 91.38,
    test_count: 0,
    conclusion: "success",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/bec3c0a1d89bda290f1a4adb9fde359654ce2401",
  },
  {
    sha: "cad139e281dd7a0e983a217329cc6f307ec00fa6",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "MORE TESTS, SEND MORE TESTS",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/cad139e281dd7a0e983a217329cc6f307ec00fa6",
      comment_count: 1,
    },
    stats: {
      total: 63,
      additions: 32,
      deletions: 31,
      date: "2023-10-07",
    },
    coverage: 87.93,
    test_count: 1,
    conclusion: "success",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/cad139e281dd7a0e983a217329cc6f307ec00fa6",
  },
  {
    sha: "5ff717ba257ac052b45af77a6aadca2f6eadbab5",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Even more tests now",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/5ff717ba257ac052b45af77a6aadca2f6eadbab5",
      comment_count: 1,
    },
    stats: {
      total: 0,
      additions: 0,
      deletions: 0,
      date: "2023-10-07",
    },
    coverage: 70.69,
    test_count: 2,
    conclusion: "success",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/5ff717ba257ac052b45af77a6aadca2f6eadbab5",
  },
  {
    sha: "6e449e2b853254ff52a789fb024dc0972c114618",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "More tests done",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/6e449e2b853254ff52a789fb024dc0972c114618",
      comment_count: 1,
    },
    stats: {
      total: 80,
      additions: 40,
      deletions: 40,
      date: "2023-10-07",
    },
    coverage: 65.52,
    test_count: 4,
    conclusion: "success",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/6e449e2b853254ff52a789fb024dc0972c114618",
  },
  {
    sha: "525f18f86f03e78277e2d0355b4cde7f14933642",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Did a lot of changes",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/525f18f86f03e78277e2d0355b4cde7f14933642",
      comment_count: 1,
    },
    stats: {
      total: 1263,
      additions: 1232,
      deletions: 31,
      date: "2023-10-07",
    },
    coverage: 22.41,
    test_count: 10,
    conclusion: "success",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/525f18f86f03e78277e2d0355b4cde7f14933642",
  },
  {
    sha: "bad4bac7433175ff06c083930599e96f46eafcde",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "This commit failed",
      url: "https://api.github.com/repos/FranAliss/parcel_jest_base_TDD/git/commits/bad4bac7433175ff06c083930599e96f46eafcde",
      comment_count: 0,
    },
    stats: {
      total: 30,
      additions: 20,
      deletions: 10,
      date: "2023-10-07",
    },
    coverage: 45.0,
    test_count: 5,
    conclusion: "failure",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/bad4bac7433175ff06c083930599e96f46eafcde",
  },
  {
    sha: "e56e226490ed47f3129a64d8de885772e9995a9f",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Update integrate.yml",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/e56e226490ed47f3129a64d8de885772e9995a9f",
      comment_count: 1,
    },
    stats: {
      total: 2,
      additions: 1,
      deletions: 1,
      date: "2023-10-07",
    },
    coverage: 100,
    test_count: 12,
    conclusion: "success",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/e56e226490ed47f3129a64d8de885772e9995a9f",
  },
  {
    sha: "0d1e0964873fbd9db2898ef06e5bed128078c876",
    author: "FranAliss",
    commit: {
      date: new Date("2023-10-07T09:45:00.000Z"),
      message: "Update integrate.yml",
      url: "https://api.github.com/repos/FranAliss/parcel_jest…/commits/7fe269f057942086fb1e8698d09f4e1100f1c5ff",
      comment_count: 1,
    },
    stats: {
      total: 2,
      additions: 1,
      deletions: 1,
      date: "2023-10-07",
    },
    coverage: 100,
    test_count: 20,
    conclusion: "failure",
    html_url: "https://github.com/FranAliss/parcel_jest_base_TDD/commit/0d1e0964873fbd9db2898ef06e5bed128078c876",
  }
];