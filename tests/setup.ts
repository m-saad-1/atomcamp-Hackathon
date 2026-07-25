// Setup file for Jest
import { sysLogger } from '../lib/observability';

beforeAll(() => {
  // Mock logger to avoid noisy tests
  jest.spyOn(sysLogger, 'info').mockImplementation(() => {});
  jest.spyOn(sysLogger, 'warn').mockImplementation(() => {});
  jest.spyOn(sysLogger, 'error').mockImplementation(() => {});
});
