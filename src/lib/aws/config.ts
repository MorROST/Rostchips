export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

export const cognitoConfig = {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

export const dynamoConfig = {
  tableName: process.env.DYNAMODB_TABLE_NAME || 'Rostcipes',
};
