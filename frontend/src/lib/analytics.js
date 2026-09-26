import { logEvent } from 'firebase/analytics';
import { analyticsPromise } from '../firebase';

export async function trackPageView(path) {
  const analytics = await analyticsPromise;
  if (!analytics) return;
  logEvent(analytics, 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export async function trackEvent(name, params = {}) {
  const analytics = await analyticsPromise;
  if (!analytics) return;
  logEvent(analytics, name, params);
}
