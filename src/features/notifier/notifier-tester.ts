import { NotifierVariant } from "../../redux/stats-api";

const testWebhook = async (url: string, message: string) => {
  const resp = await fetch(url, {
    mode: "cors",
    method: "POST",
    body: message,
  });
  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`non-ok response. error: ${errorText}`);
  }
};

const testSlack = async (url: string, message: string) => {
  const parsedUrl = new URL(url);
  if (parsedUrl.host !== "hooks.slack.com") {
    throw new Error("Invalid stack hook url");
  }

  const respText = await fetch(url, {
    mode: "cors",
    method: "POST",
    body: JSON.stringify({ text: message }),
  }).then((i) => i.text());
  if (respText !== "ok") {
    throw new Error(`non-ok response. error: ${respText}`);
  }
};

const tests: Record<
  NotifierVariant,
  (url: string, message: string) => Promise<void>
> = {
  webhook: testWebhook,
  slack: testSlack,
};

export default tests;
