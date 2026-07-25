import { StrategyRegistry, EmailExecutionStrategy } from '../lib/execution/strategies';
import { Action } from '../lib/actions/types';

describe('Execution Strategies', () => {
  it('should retrieve the correct strategy from the registry', () => {
    const strategy = StrategyRegistry.getStrategy('send_email');
    expect(strategy).toBeInstanceOf(EmailExecutionStrategy);
  });

  it('should throw an error for an unknown strategy', () => {
    expect(() => StrategyRegistry.getStrategy('unknown')).toThrow();
  });
});
