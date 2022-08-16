const moment = require('moment');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { readFile } = require('fs/promises');
const parse = require('date-fns/parse');
const addMinutes = require('date-fns/addMinutes');
const format = require('date-fns/format');
const getYear = require('date-fns/getYear');
const isValid = require('date-fns/isValid');

module.exports = {
  replaceClientVarsForPDF: (template, client) => {
    let markup = template.replace(/{client.full_name}/g, `${client.first_name} ${client.surname}`);

    markup = markup.replace(/{client.first_name}/g, client.first_name);
    markup = markup.replace(/{client.last_name}/g, client.surname);
    markup = markup.replace(/{client.email}/g, client.email);
    markup = markup.replace(/{client.company}/g, client.company_name ? client.company_name : 'N/A');
    markup = markup.replace(/{client.user_id}/g, client.userID);
    markup = markup.replace(
      /{client.phone_number}/g,
      client.phone.number ? client.phone.number : 'N/A'
    );
    markup = markup.replace(/{client.photo}/g, client.photo);
    markup = markup.replace(
      /{client.address_line_1}/g,
      client.address.line1 ? client.address.line1 : 'N/A'
    );
    markup = markup.replace(
      /{client.address_line_2}/g,
      client.address.line2 ? client.address.line2 : 'N/A'
    );
    markup = markup.replace(
      /{client.address_country}/g,
      client.address.country ? client.address.country : 'N/A'
    );
    markup = markup.replace(
      /{client.address_state}/g,
      client.address.state ? client.address.state : 'N/A'
    );
    markup = markup.replace(
      /{client.address_city}/g,
      client.address.city ? client.address.city : 'N/A'
    );
    markup = markup.replace(/{client.address_province}/g, `-`);
    markup = markup.replace(/{client.address_region_zip}/g, `-`);
    markup = markup.replace(
      /{client.address_postal_code}/g,
      client.address.postal_code ? client.address.postal_code : 'N/A'
    );
    markup = markup.replace(
      /{client.registered_date}/g,
      moment(client.registered_date).format('LLL')
    );

    return markup;
  },

  replaceClientVarsForEmail: (template, client) => {
    let markup = template.replace(/{client.full_name}/g, `${client.first_name} ${client.surname}`);

    markup = markup.replace(/{client.first_name}/g, client.first_name);
    markup = markup.replace(/{client.last_name}/g, client.surname);
    markup = markup.replace(/{client.email}/g, client.email);
    markup = markup.replace(
      /{client.company}/g,
      client.company_name ? '( Company name is not found )' : client.company_name
    );

    return markup;
  },

  replaceSettingVars: (template, settings) => {
    let markup = template.replace(/{cam.address_line_1}/g, settings.address.line1);

    markup = markup.replace(/{cam.address_line_2}/g, settings.address.line2);
    markup = markup.replace(/{cam.city}/g, settings.address.city);
    markup = markup.replace(/{cam.state}/g, settings.address.state);
    markup = markup.replace(/{cam.country}/g, 'UK');
    markup = markup.replace(/{cam.postal_code}/g, settings.address.postal_code);
    markup = markup.replace(/{cam.email}/g, settings.email);
    markup = markup.replace(/{cam.phone_number}/g, settings.phone.number);
    markup = markup.replace(/{cam.copyrightYear}/g, getYear(new Date()));

    return markup;
  },

  replaceDirectoryVars: (template, directory) => {
    let markup = template.replace(/{directory.name}/g, directory.name);

    markup = markup.replace(/{directory.address_line_1}/g, directory.address.line1);
    markup = markup.replace(/{directory.address_line_2}/g, directory.address.line2);
    markup = markup.replace(/{directory.city}/g, directory.address.city);
    markup = markup.replace(/{directory.address_state}/g, directory.address.state);
    markup = markup.replace(/{directory.address_country}/g, directory.address.country);
    markup = markup.replace(/{directory.address_postal_code}/g, directory.address.postal_code);
    markup = markup.replace(/{directory.email}/g, directory.email);
    markup = markup.replace(/{directory.contact_phone.number}/g, directory.contact_phone.number);
    markup = markup.replace(/{directory.website}/g, directory.website);

    return markup;
  },

  generateDirectoryContactTable: async (template, directoryContacts) => {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, '../public/pdf/directory_details', 'contacts_table.html'),
        'utf8',
        (err, tableTemplate) => {
          if (err) {
            reject(err);
          } else {
            let result = '';

            if (directoryContacts.length > 0) {
              const temp = `<tr style="display: table; width: 100%">
              <td style="font-size: 10px; width: 20%; padding: 10px">
                {directory.contact.name}
              </td>
              <td style="font-size: 10px; width: 20%; padding: 10px 10px 10px 0">
                {directory.contact.designation}
              </td>
              <td style="font-size: 10px; width: 25%; padding: 10px 10px 10px 0">
                {directory.contact.email}
              </td>
              <td style="font-size: 10px; width: 15%">9876543210</td>
              <td style="font-size: 10px; width: 20%">
                {directory.contact.address_line_1} <br />
                {directory.contact.city} {directory.contact.address_state}
                {directory.contact.address_country} {directory.contact.address_postal_code}
              </td>
            </tr>`;

              const table_body = directoryContacts.map((contact) => {
                let markup = temp.replace(/{directory.contact.name}/g, contact.name);
                markup = markup.replace(/{directory.contact.designation}/g, contact.designation);
                markup = markup.replace(/{directory.contact.email}/g, contact.email);
                markup = markup.replace(
                  /{directory.contact.address_line_1}/g,
                  contact.address.line1
                );
                markup = markup.replace(
                  /{directory.contact.address_line_2}/g,
                  contact.address.line2
                );
                markup = markup.replace(/{directory.contact.city}/g, contact.address.city);
                markup = markup.replace(
                  /{directory.contact.address_state}/g,
                  contact.address.state
                );
                markup = markup.replace(
                  /{directory.contact.address_country}/g,
                  contact.address.country
                );
                markup = markup.replace(
                  /{directory.contact.address_postal_code}/g,
                  contact.address.postal_code
                );

                return markup;
              });

              result = tableTemplate.replace(/{{table_body}}/g, table_body.join(''));

              result = template.replace(/{{table_body}}/g, result);
            } else {
              result = template.replace(/{{table_body}}/g, '');
            }

            resolve(result);
          }
        }
      );
    });
  },

  replaceReqVars: (template, { otp, redirectUrl }) => {
    let markup = template.replace(/{request.otp}/g, otp);
    markup = markup.replace(/{request.redirectUrl}/g, redirectUrl);
    return markup;
  },

  replaceQuoteVars: (
    template,
    { redirectUrl = '', quoted_amount = '', quoteId = '', quoteRemark = '', quoteStatus }
  ) => {
    let markup = template.replace(/{quote.redirectUrl}/g, redirectUrl);
    markup = markup.replace(/{quote.quotedAmount}/g, quoted_amount);
    markup = markup.replace(/{quote.quoteId}/g, quoteId);
    markup = markup.replace(/{quote.quoteRemark}/g, quoteRemark);
    markup = markup.replace(
      /{quote.quoteStatus}/g,
      quoteStatus === 1
        ? 'Opened'
        : quoteStatus === 2
        ? 'Accepted'
        : quoteStatus === 3
        ? 'Declined'
        : ''
    );
    return markup;
  },

  replaceShopOrderVars: (template, { type, orderId }) => {
    let markup = template.replace(/{shop.type}/g, type);
    markup = markup.replace(/{shop.orderId}/g, orderId);
    return markup;
  },

  replaceTrainingVars: (template, { training, redirectUrl, rejectionReason, tutors }) => {
    let markup = template;

    if (redirectUrl) markup = markup.replace(/{training.redirectUrl}/g, redirectUrl);
    if (training.title) markup = markup.replace(/{training.title}/g, training.title);
    if (training.type) markup = markup.replace(/{training.type}/g, training.type.toLowerCase());
    if (rejectionReason) markup = markup.replace(/{training.rejectionReason}/g, rejectionReason);
    if (tutors) markup = markup.replace(/{training.instructors.name}/g, tutors);

    return markup;
  },

  replaceBookingVars: (template, { booking, redirectUrl, meetLinks }) => {
    let markup = template;

    if (booking.time) {
      markup = markup.replace(/{booking.time.from}/g, booking.time[0]);
      markup = markup.replace(
        /{booking.time.to}/g,
        format(addMinutes(parse(booking.time[booking.time.length - 1], 'p', new Date()), 30), 'p')
      );
    }

    if (booking.date && isValid(new Date(booking.date))) {
      markup = markup.replace(
        /{booking.date}/g,
        format(new Date(booking.date), 'EEEE, MMMM d,yyyy')
      );
    }

    if (booking.details.name) {
      markup = markup.replace(/{booking.name}/g, booking.details.name);
    }

    if (booking.details.email) {
      markup = markup.replace(/{booking.email}/g, booking.details.email);
    }

    if (meetLinks) {
      markup = markup.replace(/{booking.meet.link}/g, meetLinks);
    }

    if (redirectUrl) markup = markup.replace(/{booking.redirectUrl}/g, redirectUrl);

    return markup;
  },

  generateShopOrderTemplate: async (order) => {
    const priceMarkup = (price) =>
      `<p style="line-height: 1.55; font-weight: 600; margin: 13px 0 10px 0">£${price}</p>`;

    const creditMarkup = (
      credits
    ) => `<div style="line-height: 1.55; font-weight: 600; margin: 13px 0 10px 0">
          <div
            style="
              display: -webkit-inline-box;
              display: -ms-inline-flexbox;
              display: inline-flex;
              -webkit-box-align: center;
              -ms-flex-align: center;
              align-items: center;
              -webkit-box-pack: end;
              -ms-flex-pack: end;
              justify-content: flex-end;
            "
          >
            <img
              src="https://i.ibb.co/vjGnfYh/credit-Icon.png"
              width="18"
              height="18"
              alt="Credit"
            />&nbsp;
            <span style="font-weight: 600">${credits}</span>
          </div>
        </div>`;

    try {
      const template = await readFile(
        path.join(__dirname, '../views/email/shop/order-confirmed-index.html'),
        { encoding: 'utf-8' }
      );

      const orderTemplate = await readFile(
        path.join(__dirname, `../views/email/shop/order-confirmed-${order.type}.html`),
        { encoding: 'utf-8' }
      );

      let html = '';

      if (_.isEmpty(order.cartData)) {
        // If cartData is Empty then type === Uniform || type === ID Card
        if (order.type === 'ID Card' && order.id_cards.length) {
          html = order.id_cards
            .map((idCard) => {
              let h = orderTemplate;

              h = h.replace(/{{id_card.name}}/g, idCard.name);
              h = h.replace(/{{id_card.job}}/g, idCard.job);
              h = h.replace(/{{id_card.emp_no}}/g, idCard.emp_no);
              h = h.replace(/{{id_card.emp_no}}/g, idCard.emp_no);
              if (order.credits) h = h.replace(/{{id_card.price}}/g, creditMarkup(1));

              return h;
            })
            .join(' ');
        } else if (order.type === 'Uniform') {
          const cb = (u) => {
            let h = orderTemplate;

            h = h.replace(/{{uniform.name}}/g, u.name);
            h = h.replace(/{{uniform.style}}/g, u.style);
            h = h.replace(/{{uniform.quantity}}/g, u.quantity);
            h = h.replace(/{{uniform.color}}/g, u.color);
            h = h.replace(/{{uniform.trim_color}}/g, u.trim_color);
            h = h.replace(/{{uniform.size}}/g, u.size);
            h = h.replace(/{{uniform.price}}/g, creditMarkup(u.quantity));

            return h;
          };

          html += order.female_nurse.map(cb).join(' ');
          html += order.female_carer.map(cb).join(' ');
          html += order.male_nurse.map(cb).join(' ');
          html += order.male_carer.map(cb).join(' ');
        }
      } else {
        // If cartData is found not empty then type === Product || type === Business Card || type === Leaflet || type === Readymade Uniform

        const { 0: data } = order.cartData;

        html = orderTemplate;

        if (data.name) html = html.replace(/{{product.name}}/g, data.name);
        if (data.quantity) html = html.replace(/{{product.quantity}}/g, data.quantity);
        if (data.printSide) html = html.replace(/{{product.printSide}}/g, data.printSide);
        if (data.color) html = html.replace(/{{product.color}}/g, data.color);
        if (data.size) html = html.replace(/{{product.size}}/g, data.size);

        if (order.price) {
          html = html.replace(/{{product.price}}/g, priceMarkup(order.price));
        }
        if (order.credits) {
          html = html.replace(/{{product.price}}/g, creditMarkup(order.credits));
        }
      }

      let result = template.replace(/{{shop.order}}/g, html);
      result = result.replace(/{{shop.transactionId}}/g, order.transactionID);

      return result;
    } catch (error) {
      throw error;
    }
  },
};
