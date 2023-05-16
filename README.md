# MetahiSDK for javascript

`@metahi/js-sdk` is a helper which assists you in integrating MetahiSDK into your web app.

## Installation

```
yarn add @metahi/js-sdk
```

or

```
npm install @metahi/js-sdk
```

## Documentation

```
import MetahiSDK from '@metahi/js-sdk';
```

First of all, you need to create a configuration object:

```
const metahiSDK = new MetahiSDK(options);
```

### Options

| Property                                                                                                                                                                                                                           |           Required           |   Type    |     Default value      |  Possible value(s)   | Description                                                                                                                                                                             |
|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------:|:---------:|:----------------------:|:--------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **partner_id**                                                                                                                                                                                                                     |           required           | *String*  |                        |                      | **partner_id** will be given to you upon your registration as partner. It's required to track your commission and statistics. If you don't have one, [contact us](https://metahi.world) |
| **container_id**                                                                                                                                                                                                                   |     required / optional      | *String*  |                        |                      | ID of the parent DOM element of the module. Required if you want to use the **mount** method.                                                                                           |
| **origin**                                                                                                                                                                                                                         |           optional           | *String*  | `https://metahi.world` | `https://metahi.dev` | Required to initialise the module in the specific environment.                                                                                                                          |
| **autosize**                                                                                                                                                                                                                       |           optional           | *Boolean* |        `false`         |    `true, false`     | By default, module will use 100% of the width and 100% of the height of the parent element. If 'true', width and height options are ignored.                                            |
| **width**                                                                                                                                                                                                                          |           optional           | *Number*  |                        |                      | Fixed module width, in pixels.                                                                                                                                                          |
| **height**                                                                                                                                                                                                                         |           optional           | *Boolean* |                        |                      | Fixed module height, in pixels.                                                                                                                                                         |

### How to open specific page

After initializing your widget, call a method **open()** to open specific page or functionality

```
import MetahiSDK from '@metahi/js-sdk';

const metahiSDK = new MetahiSDK(options);

metahiSDK.open(name, params, query);
```

### open() options

name = collections/collection/assets/asset
params
for: collection = { collectionId }
for: asset = { assetId }

read more in index.ts -> screenTypes

### How to change theme or branding

For now we do not allow any theme configuration via sdk initialization. You can configure your theme on partners settings page.