const mockApi = {
  rest: {
    pulls: {
      list: jest.fn().mockResolvedValue({}),
      get: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      merge: jest.fn().mockResolvedValue({}),
    },
    issues: {
      addLabels: jest.fn().mockResolvedValue({}),
    }
  },
};
export const getOctokit = jest.fn().mockImplementation(() => mockApi);
