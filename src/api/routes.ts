import routes from "@/config/routes.json";

type RouteParams = Record<string, string | number>;

function substitute(template: string, params: RouteParams): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(String(value))),
    template
  );
}

export function withQuery(
  path: string,
  search: URLSearchParams | Record<string, string | undefined>
): string {
  const params =
    search instanceof URLSearchParams
      ? search
      : Object.entries(search).reduce((query, [key, value]) => {
          if (value != null && value !== "") query.set(key, value);
          return query;
        }, new URLSearchParams());

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const apiRoutes = {
  schedules: {
    list: routes.schedules.list,
    byId: (scheduleId: string) => substitute(routes.schedules.byId, { scheduleId })
  },
  submissions: {
    submit: routes.submissions.submit,
    list: routes.submissions.list
  },
  dashboard: routes.dashboard,
  profile: routes.profile,
  settings: {
    root: routes.settings.root,
    tradingPartners: routes.settings.tradingPartners,
    integrationStatus: routes.settings.integrationStatus
  },
  edifact: routes.edifact,
  labels: routes.labels
} as const;
