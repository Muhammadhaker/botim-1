const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '7523714016:AAHHMIvcVGob6MdDPk_O0FOku_p-EucEE9I';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.setMyCommands([
	{ command: '/start', description: "Kurslar haqida ma'lumot" },
	{ command: '/courses', description: 'Barcha kurslar' },
]);

bot.on('message', async msg => {
	const chatId = msg.chat.id;
	const text = msg.text;

	if (text === '/start') {
		await bot.sendMessage(
			chatId,
			'Sammi.ac platformasi orqali yasalgan',
			{
				reply_markup: {
					keyboard: [
						[
							{
								text: "🛒 Boom shop",
								web_app: {
									url:'https://boom-shop-mlaa.onrender.com/',
								},
							},
                            {
								text: '🟢 Google',
								web_app:{
                                    url: 'https://google.com',
                                }
							},
						],
						[
							
							{
								text: '📺 YouTube',
								web_app:{
                                    url: 'https://youtube.com',
                                }
							},
							{
								text: '📸 Instagram',
							web_app:{
                                url: 'https://instagram.com',
                            }
							},
						],
					],
					resize_keyboard: true,
				},
			}
		);
	}

	

	if (msg.web_app_data?.data) {
		try {
			const data = JSON.parse(msg.web_app_data?.data);

			await bot.sendMessage(
				chatId,
				"Bizga ishonch bildirganingiz uchun raxmat, siz sotib olgan kurslarni ro'yhati"
			);

			for (const item of data) {
				await bot.sendPhoto(chatId, item.Image);
				await bot.sendMessage(
					chatId,
					`${item.title} - ${item.quantity}x`
				);
			}

			await bot.sendMessage(
				chatId,
				`Umumiy narx - ${data
					.reduce((a, c) => a + c.price * c.quantity, 0)
					.toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD',
					})}`
			);
		} catch (error) {
			console.log(error);
		}
	}
});

app.post('/web-data', async (req, res) => {
	const { queryID, products } = req.body;

	try {
		await bot.answerWebAppQuery(queryID, {
			type: 'article',
			id: queryID,
			title: 'Muvaffaqiyatli xarid qildingiz',
			input_message_content: {
				message_text: `Xaridingiz bilan tabriklayman, siz ${products
					.reduce((a, c) => a + c.price * c.quantity, 0)
					.toLocaleString('en-US', {
						style: 'currency',
						currency: 'USD',
					})} qiymatga ega mahsulot sotib oldingiz, ${products
					.map(c => `${c.title} ${c.quantity}X`)
					.join(', ')}`,
			},
		});
		return res.status(200).json({});
	} catch (error) {
		return res.status(500).json({});
	}
});

app.listen(process.env.PORT || 8000, () =>
	console.log('Server started')
);
