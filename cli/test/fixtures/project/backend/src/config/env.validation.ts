import * as Joi from 'joi';

export default Joi.object({
  APP_NAME: Joi.string().required(),
  /* cfsa:env */
});
