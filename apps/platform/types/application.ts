export type ApplicationComponent = {
  name: string;

  type:
    | "stats"
    | "table"
    | "list"
    | "form"
    | "detail"
    | "calendar"
    | "chart"
    | "text";

  entity: string;

  purpose: string;
};

export type ApplicationBlueprint = {
  projectName: string;
  description: string;

  pages: {
    name: string;
    path: string;
    purpose: string;

    components: ApplicationComponent[];
  }[];

  features: {
    name: string;
    description: string;
  }[];

  database: {
    name: string;
    purpose: string;

    fields: {
      name: string;
      type: string;
      required: boolean;
    }[];
  }[];

  apiRoutes: {
    method:
      | "GET"
      | "POST"
      | "PUT"
      | "PATCH"
      | "DELETE";

    path: string;
    purpose: string;

    entity: string;
  }[];

  actions: {
    name: string;
    description: string;
    trigger: string;
    entity: string;
  }[];

  nextSteps: string[];
};

export type UserType = {
  name: string;
  description: string;
};

export type Foundation = {
  authentication: boolean;
  database: boolean;
  rolesAndPermissions: boolean;
  billing: boolean;
  email: boolean;
  errorHandling: boolean;
  testing: boolean;
};

export type Analysis = {
  productName: string;
  summary: string;
  users: UserType[];
  features: string[];
  dataModel: string[];
  foundation: Foundation;
  recommendations: string[];
};