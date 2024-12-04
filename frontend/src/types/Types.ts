export interface IntegrationItem {
  id: string;
  name: string;
  type: string;
  categories: string[];
  style: {
    fieldActiveLight: string;
    buttonPrimaryLight: string;
    buttonHoverLight: string;
    buttonTextLight: string;
    buttonTextHoverLight: string;
    fieldActiveDark: string;
    buttonPrimaryDark: string;
    buttonHoverDark: string;
    buttonTextDark: string;
    buttonTextHoverDark: string;
  };
  logo: {
    logoLightUrl: string;
    logoDarkUrl: string;
    logoWhiteUrl: string;
    logoBlackUrl: string;
    logoColorUrl: string;
    iconLightUrl: string;
    iconDarkUrl: string;
    iconWhiteUrl: string;
    iconBlackUrl: string;
    iconColorUrl: string;
    base64Logo: string;
  };
  forgotPasswordLink: string;
  cryptoTransfersSupported: boolean;
}

export interface IntegrationResponse {
  content: {
    items: IntegrationItem[];
  };
}

export interface Balance {
  symbol: string;
  buyingPower: number;
  cryptoBuyingPower: number;
  cash: number;
}

export interface Account {
  meshAccountId: string;
  frontAccountId: string;
  accountId: string;
  accountName: string;
  fund: number;
  cash: number;
  balances: Balance[];
}

export interface AccountToken {
  account: Account;
  accessToken: string;
  refreshToken: string;
}

export interface BrokerBrandInfo {
  brokerLogoUrl: string;
  brokerLogo: string;
}

export interface AccessToken {
  accountTokens: AccountToken[];
  brokerType: string;
  brokerName: string;
  brokerBrandInfo: BrokerBrandInfo;
}

export interface IntegrationPayload {
  accessToken: AccessToken;
}

export interface IntegrationItem {
  id: string;
  name: string;
  type: string;
  categories: string[];
}

export interface IntegrationResponse {
  content: {
    items: IntegrationItem[];
  };
}
