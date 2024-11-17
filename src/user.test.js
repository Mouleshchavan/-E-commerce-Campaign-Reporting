const { createUser, getUsers, updateUser, deleteUser } = require('../src/controllers/userController')
const httpMocks = require('node-mocks-http'); // For mocking request and response objects

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  it('should create a new user with valid data', async () => {
    req.body = { username: 'john', password: 'password123', email: 'john@example.com' };
    await createUser(req, res);
    expect(res.json).toHaveBeenCalledWith({
      errors: '',
      data: { id: 1, username: 'john', email: 'john@example.com' }
    });
  });

  it('should get all users when no ID is provided', async () => {
    await getUsers(req, res);
    expect(res.json).toHaveBeenCalledWith({
      errors: '',
      data: [{ id: 1, username: 'john', email: 'john@example.com' }]
    });
  });

  it('should get a user by ID', async () => {
    req.params.id = 1;
    await getUsers(req, res);
    expect(res.json).toHaveBeenCalledWith({
      errors: '',
      data: { id: 1, username: 'john', email: 'john@example.com' }
    });
  });

  it('should return an error if user not found by ID', async () => {
    req.params.id = 999; // Non-existing user
    await getUsers(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ errors: 'User not found' });
  });

  it('should update a user by ID', async () => {
    req.params.id = 1;
    req.body = { username: 'johnny', email: 'johnny@example.com' };
    await updateUser(req, res);
    expect(res.json).toHaveBeenCalledWith({
      errors: '',
      data: { id: 1, username: 'johnny', email: 'johnny@example.com' }
    });
  });

  it('should return an error if no fields to update', async () => {
    req.params.id = 1;
    req.body = {}; // No fields to update
    await updateUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: 'Nothing to update' });
  });

  it('should delete a user by ID', async () => {
    req.params.id = 1;
    await deleteUser(req, res);
    expect(res.json).toHaveBeenCalledWith({
      errors: '',
      data: { message: 'User deleted successfully' }
    });
  });

  it('should return an error if user not found to delete', async () => {
    req.params.id = 999; // Non-existing user
    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ errors: 'User not found' });
  });
});
