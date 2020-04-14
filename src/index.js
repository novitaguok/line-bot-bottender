const { lineRouter, line } = require('bottender/router');
const fileType = require('file-type');
const fs = require('fs');
const express = require('express');
const router = express.Router();

// URL Shortener
const validUrl = require('valid-url');
const shortid = require('shortid');
const config = require('config');
const url = require('../models/UrlModel');

// @route POST /api/shorten
// @desc  create short URL
// router.post('/shorten', async (req, res) => {
async function createShortUrl(req, res) {
  const { longUrl } = req.body;

  const baseUrl = config.get('baseUrl');

  // Check base URL
  if (!validUrl.isUri(baseUrl)) {
    return res.status(401).json('Invalid Base URL');
  }

  // Create URL code
  const urlCode = shortid.generate();

  // Check long URL
  if (validUrl.isUri(longUrl)) {
    try {
      let url_req = await url.findOne({ longUrl });
      if (url_req) {
        res.json(url_req);
      } else {
        const shortUrl = baseUrl + '/' + urlCode;

        // Save to MongoDB
        url_req = new UrlModel({
          longUrl,
          shortUrl,
          urlCode,
          date: new Date(),
        });

        await url_req.save(); // Save the URL to database
      }
    } catch (err) {
      console.err(err);
      res.status(500).json('Server error occured');
    }
  } else {
    res.status(401).json('Invalid long URL');
  }
}

// Redirect to long URL
async function redirect(req, res) {
  try {
    const url_req = await url.findOne({ urlCode: req.params.code });

    if (url_req) {
      return res.redirect(url.longUrl);
    } else {
      return res.status(404).json('No URL found!');
    }
  } catch (err) {
    console.log(err);
    res.status(500).json('Server error');
  }
}

// LINE Functions
const quickReply = {
  items: [
    {
      type: 'action',
      action: {
        type: 'cameraRoll',
        label: 'Send photo',
      },
    },
    {
      type: 'action',
      action: {
        type: 'camera',
        label: 'Open camera',
      },
    },
    {
      type: 'action',
      action: {
        type: 'uri',
        label: 'View details',
        uri: 'http://example.com/page/222',
      },
    },
  ],
};

async function HandleFollow(context) {
  await context.sendText(
    'Hello! I am Novibot. Tap on those any button to have fun!',
    {
      quickReply,
    }
  );

  console.log(context.event.follow);
  // {
  //   type: 'user',
  //   userId: 'U206d25c2ea6bd87c17655609a1c37cb8',
  // }
}

async function HandleUnfollow(context) {
  console.log(context.event.unfollow);
  // {
  //   type: 'user',
  //   userId: 'U206d25c2ea6bd87c17655609a1c37cb8',
  // }
}

async function HandleJoin(context) {
  await context.sendText('Hello!');
  console.log(context.event.join);
  // {
  //   type: 'group',
  //   groupId: 'cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // }
}

async function HandleLeave(context) {
  await context.sendText('So sorry, I have to leave ಠ_ಥ');
  console.log(context.event.leave);
  // {
  //   type: 'group',
  //   groupId: 'cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  // }
}

module.exports = async function App(context) {
  if (context.event.isFollow) {
    return HandleFollow;
  }

  if (context.event.isUnfollow) {
    return HandleUnfollow;
  }

  if (context.event.isJoin) {
    return HandleJoin;
  }

  if (context.event.isLeave) {
    return HandleLeave;
  }

  if (context.event.isText) {
    if (context.event.text == 'url') {
      await context.sendText('Paste your URL ^_^');
      req = context.event.text;
      let url = createShortUrl(req, res);
      await context.sendText(url);
    }
    await context.sendText(`received the text message: ${context.event.text}`, {
      quickReply,
    });
  } else if (context.event.isPayload) {
    await context.sendText(`received the payload: ${context.event.payload}`);
  } else if (context.event.isImage) {
    await context.sendImage({
      originalContentUrl: 'https://example.com/image.jpg',
      previewImageUrl: 'https://example.com/preview.jpg',
    });
    // const buffer = await context.getMessageContent();
    // const { ext } = fileType(buffer);

    // const filename = `my-file.${ext}`;

    // // You can do whatever you want, for example, write buffer into file system
    // await fs.promises.writeFile(filename, buffer);
  } else if (context.event.isVideo) {
    await context.sendVideo({
      originalContentUrl: 'https://example.com/video.mp4',
      previewImageUrl: 'https://example.com/preview.jpg',
    });
  } else if (context.event.isAudio) {
    await context.sendAudio({
      originalContentUrl: 'https://example.com/audio.mp3',
      duration: 240000,
    });
  } else if (context.event.text == 'Hi') {
    await context.sendText('Hi');
    const imagemap = {
      baseUrl: 'https://via.placeholder.com/800',
      baseSize: {
        height: 1040,
        width: 1040,
      },
      actions: [
        {
          type: 'uri',
          linkUri: 'https://placeholder.com/',
          area: {
            x: 0,
            y: 0,
            width: 520,
            height: 1040,
          },
        },
        {
          type: 'message',
          text: 'hello',
          area: {
            x: 520,
            y: 0,
            width: 520,
            height: 1040,
          },
        },
      ],
    };
    const altText = 'this is an imagemap';
    await context.sendImagemap(altText, imagemap);
  } else if (context.event.text == 'Shopping') {
    // const template = {
    //   thumbnailImageUrl: 'https://example.com/bot/images/image.jpg',
    //   title: 'Menu',
    //   text: 'Please select',
    //   actions: [
    //     {
    //       type: 'postback',
    //       label: 'Buy',
    //       data: 'action=buy&itemid=123',
    //     },
    //     {
    //       type: 'postback',
    //       label: 'Add to cart',
    //       data: 'action=add&itemid=123',
    //     },
    //     {
    //       type: 'uri',
    //       label: 'View detail',
    //       uri: 'http://example.com/page/123',
    //     },
    //   ],
    // };
    // const altText = 'this is a button template';
    // await context.sendButtonTemplate(altText, template);

    const template = [
      {
        thumbnailImageUrl: 'https://example.com/bot/images/item1.jpg',
        title: 'this is menu',
        text: 'description',
        actions: [
          {
            type: 'postback',
            label: 'Buy',
            data: 'action=buy&itemid=111',
          },
          {
            type: 'postback',
            label: 'Add to cart',
            data: 'action=add&itemid=111',
          },
          {
            type: 'uri',
            label: 'View detail',
            uri: 'http://example.com/page/111',
          },
        ],
      },
      {
        thumbnailImageUrl: 'https://example.com/bot/images/item2.jpg',
        title: 'this is menu',
        text: 'description',
        actions: [
          {
            type: 'postback',
            label: 'Buy',
            data: 'action=buy&itemid=222',
          },
          {
            type: 'postback',
            label: 'Add to cart',
            data: 'action=add&itemid=222',
          },
          {
            type: 'uri',
            label: 'View detail',
            uri: 'http://example.com/page/222',
          },
        ],
      },
    ];
    const altText = 'this is a carousel template';
    await context.sendCarouselTemplate(altText, template);
  } else {
    await context.sendText('Sorry, typo eh?');
  }
};
