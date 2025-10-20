var mustache = require("mustache");
var fs = require("fs");
const config = require('../../config');

// load AWS SDK v3
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// create SES client
const ses = new SESClient({
    region: config.aws.region,
    credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey
    }
});

/**
 * Render a mustache template with data
 * @param {string} templatePath - Path to the template file
 * @param {Object} data - Data to render in the template
 * @param {Object} additionalContext - Additional context variables for the template
 * @returns {Promise<string>} Rendered template content
 */
function renderTemplate(templatePath, data, additionalContext = {}) {
    return new Promise((resolve, reject) => {
        fs.readFile(templatePath, 'utf-8', function (err, template) {
            if (err) {
                reject(err);
                return;
            }
            
            const context = {
                data: data,
                fontSize: 11,
                bigFontSize: 14,
                hugeFontSize: 32,
                footerFontSize: 8,
                iconWidth: 32,
                tenantName: config.tenant.name,
                tenantWebsite: config.tenant.website,
                tenantBankWireTransferInstructions: config.tenant.bankWireTransferInstructions,
                tenantAddress: config.tenant.address,
                tenantCity: config.tenant.city,
                tenantState: config.tenant.state,
                tenantZip: config.tenant.zip,
                tenantPhone: config.tenant.phone,
                tenantFax: config.tenant.fax,
                tenantAppRoot: config.tenant.appRoot,
                ...additionalContext
            };
            
            try {
                const output = mustache.to_html(template, context);
                resolve(output);
            } catch (renderErr) {
                reject(renderErr);
            }
        });
    });
}

/**
 * Send an email using AWS SES
 * @param {string|Array<string>} to - Email address(es) to send to
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content of the email
 * @param {string} textContent - Plain text content of the email (optional)
 * @returns {Promise} Promise that resolves when email is sent
 */
function sendEmail(to, subject, htmlContent, textContent = null) {
    const toAddresses = Array.isArray(to) ? to : [to];
    
    const command = new SendEmailCommand({
        Source: config.tenant.email,
        Destination: {
            ToAddresses: toAddresses
        },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Text: {
                    Data: textContent || 'This email can only be viewed using an HTML-capable email browser'
                },
                Html: {
                    Data: htmlContent
                }
            }
        }
    });

    return ses.send(command);
}

/**
 * Send a templated email
 * @param {string|Array<string>} to - Email address(es) to send to
 * @param {string} subject - Email subject
 * @param {string} templatePath - Path to the template file
 * @param {Object} data - Data to render in the template
 * @param {string} note - Optional note to prepend to the email content
 * @param {Object} additionalContext - Additional context variables for the template
 * @returns {Promise} Promise that resolves when email is sent
 */
async function sendTemplatedEmail(to, subject, templatePath, data, note = '', additionalContext = {}) {
    try {
        const renderedContent = await renderTemplate(templatePath, data, additionalContext);
        const htmlContent = note ? `<p>${note}</p>${renderedContent}` : renderedContent;
        
        return await sendEmail(to, subject, htmlContent);
    } catch (error) {
        console.error('Error sending templated email:', error);
        throw error;
    }
}

/**
 * Parse email addresses from a string (comma, space, or newline separated)
 * @param {string} emailString - String containing email addresses
 * @returns {Array<string>} Array of email addresses
 */
function parseEmailAddresses(emailString) {
    return emailString.split(/[ ,\n]+/).filter(email => email.trim().length > 0);
}

module.exports = {
    renderTemplate,
    sendEmail,
    sendTemplatedEmail,
    parseEmailAddresses
};
