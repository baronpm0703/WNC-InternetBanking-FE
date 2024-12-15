/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				lexend: ['Lexend', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			width: {
				'1/2': '50%',
				'1/3': '33.3333333%',
				'2/3': '66.6666667%',
				'1/4': '25%',
				'3/4': '75%',
				'1/5': '20%',
				'2/5': '40%',
				'3/5': '60%',
				'4/5': '80%',
				'1/6': '16.6666667%',
				'5/6': '83.3333333%',
				'1/7': '14.2857143%',
				'2/7': '23.5%',
				'3/7': '42.8571429%',
				'4/7': '57.1428571%',
				'5/7': '71.4285714%',
				'6/7': '85.7142857%',
				'1/8': '12.5%',
				'3/8': '37.5%',
				'5/8': '62.5%',
				'7/8': '87.5%',
				'1/9': '11.1111111%',
				'2/9': '22.2222222%',
				'4/9': '44.4444444%',
				'5/9': '55.5555556%',
				'7/9': '77.7777778%',
				'8/9': '88.8888889%',
				'1/10': '10%',
				'3/10': '30%',
				'7/10': '70%',
				'9/10': '90%',
				'1/11': '9.0909091%',
				'2/11': '18.1818182%',
				'3/11': '27.2727273%',
				'4/11': '36.3636364%',
				'5/11': '45.4545455%',
				'6/11': '54.5454546%',
				'7/11': '63.6363637%',
				'8/11': '72.7272728%',
				'9/11': '81.8181819%',
				'10/11': '90.909091%',
				'1/12': '8.3333333%',
				'5/12': '41.6666667%',
				'7/12': '58.3333333%',
				'11/12': '91.6666667%',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}

