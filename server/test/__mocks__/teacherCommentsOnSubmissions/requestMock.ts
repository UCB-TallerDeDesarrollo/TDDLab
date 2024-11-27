// tests/__mocks__/TeacherComments/requestMock.ts
export const createRequest = (body = {}, params = {}) => ({
  body,
  params,
});

export const createResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
  