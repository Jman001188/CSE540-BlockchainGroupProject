/**
 * Types based on DesignArchitectureidea.md... 
 */
export interface LoginResponse {
  sessionToken: string;
  user: {
    userID: number;
    firstName: string;
    lastName: string;
  };
  company: {
    companyID: number;
    companyName: string;
    permission: string
    // other information...
  };
}

export interface RegisterResponse {
  userId: string;
  registrationToken: string;
}

/**
 * Mock APIs 
 */

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  // login logic...

  return {
    sessionToken: "jwt-abc-xyz",
    user: {
      userID: 12355251234,
      firstName: "first",
      lastName: "last"
    },
    company: {
      companyID: 12312376823,
      companyName: "Company Name",
      permission: "Basic"
    },
  };
};

export const logout = async (token: string): Promise<{ success: boolean }> => {
  // logout logic...
  
  return {
    success: true
  };
};

export const register = async (type: string, companyId: string, email: string): Promise<RegisterResponse> => {
  // register logic...

  return {
    userId: "user-uuid-123",
    registrationToken: ""
  };
};


export const companyApi = {
  getCompany: async (companyId: string, permission: string) => {
    // getCompany logic...
    return {
      companyID: companyId,
      companyName: "Company Name",
      // other information...
    };
  },

  updateCompany: async (companyId: string, data: any) => {
    // update company logic...
    return {
      success: true
    };
  },
};

export const userApi = {
  getUser: async (userId: string) => {
    // getUser logic...
    return {
      firstName: "First",
      lastName: "Last",
    };
  },

  updateUser: async (userId: string, data: any) => {
    // updateUser logic...
    return {
      success: true
    };
  },
};

/**
 * Need to design transfer-related apis... 
 */