import { JWT } from 'google-auth-library';
import axios from 'axios';
import NotificationRepo from '../../database/repository/NotificationRepo';
import { NotificationConfig } from '../../configVars';

const getAccessToken = () => {
  return new Promise(function (resolve, reject) {
    const jwtClient = new JWT(
      NotificationConfig.client_email,
      undefined,
      NotificationConfig.private_key,
      ['https://www.googleapis.com/auth/firebase.messaging'],
      undefined
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens!.access_token);
    });
  });
};

const sendNotif = async (
  token: string,
  title: string,
  body: string,
  data: object,
  topic: string
) => {
  try {
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    const payload = {
      message: {
        topic,
        notification: {
          title,
          body,
        },
        data,
      },
    };

    return await axios({
      method: 'post',
      url: `https://fcm.googleapis.com/v1/projects/${NotificationConfig.project_id}/messages:send`,
      data: payload,
      headers,
    });
  } catch (error: any) {
    console.log(error.message);
  }
};

const sendDataNotif = async (token: string, data: object, topic: string) => {
  try {
    const headers = {
      Authorization: 'Bearer ' + token,
    };

    const payload = {
      message: {
        topic,
        data,
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              'content-available': 1,
            },
          },
        },
      },
    };
    // const payload = {
    //   message: {
    //     topic,
    //     data,
    //   },
    // };

    return await axios({
      method: 'post',
      url: `https://fcm.googleapis.com/v1/projects/${NotificationConfig.project_id}/messages:send`,
      data: payload,
      headers,
    });
  } catch (error: any) {
    console.log(error.message);
  }
};

// ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const sendNotifUser = async (userId: string, content: any) => {
  const token = (await getAccessToken()) as string;
  await sendDataNotif(token, content.data, userId);
  await NotificationRepo.create({
    userId,
    title: content.data.title,
    body: content.data.body,
    data: content.data,
  });
};

export const sendDataNotifUserMessage = async (
  userId: string,
  content: any
) => {
  const token = (await getAccessToken()) as string;
  await sendDataNotif(token, content.data, userId);
};
