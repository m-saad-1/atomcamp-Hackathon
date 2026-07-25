import { EmailIntegration } from './index';

export class GmailIntegration extends EmailIntegration {
  name = 'GmailProvider';
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendEmail(to: string, subject: string, _body: string): Promise<void> {
    return this.executeWithRetry(async () => {
      console.log(`[GmailIntegration] Sending email to ${to} | Subject: ${subject}`);
      
      // TODO: Connect to actual Google API using OAuth tokens
      // For Sprint 6, we simulate network delay and successful send
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return Promise.resolve();
    });
  }

  async fetchEmails(query: string): Promise<unknown[]> {
    return this.executeWithRetry(async () => {
      console.log(`[GmailIntegration] Fetching emails for query: ${query}`);
      return Promise.resolve([]);
    });
  }
}
