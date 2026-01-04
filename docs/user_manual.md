# 📖 User Manual — Flow Logic Platform

**Версия:** 1.0  
**Дата:** 2025-12-22  
**Для:** End Users

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Registration & Login](#registration--login)
3. [Choosing a Tier](#choosing-a-tier)
4. [Taking Assessment Tests](#taking-assessment-tests)
5. [Viewing Results](#viewing-results)
6. [Exercises & Training Plans](#exercises--training-plans) (Basic+)
7. [Progress Tracking](#progress-tracking) (Basic+)
8. [Account Management](#account-management)
9. [FAQ](#faq)

---

## 🚀 Getting Started

### What is Flow Logic?

**Flow Logic** is a B2C platform for assessing movement quality through **MediaPipe pose estimation** and subsequent correction through **AI-generated plans**, **smart calendar**, **progress charts**, and **retention improvements**.

**Key Features:**
- Movement quality assessment tests
- Instant results with scores and problem areas
- Personalized exercises and training plans (Basic+)
- Progress tracking and visualizations (Basic+)

**Important:** Flow Logic is a **wellness product only** and is **not a medical product**. It does not provide medical diagnosis or treatment.

---

## 📝 Registration & Login

### Creating an Account

1. **Navigate to Registration Page**
   - Go to `https://flowlogic.shop/register`
   - Click "Sign Up" or "Register"

2. **Fill Registration Form**
   - **Email:** Enter your email address
   - **Password:** Minimum 8 characters (letters, numbers, special characters recommended)
   - **Name:** Enter your name (optional)
   - **Wellness Disclaimer:** Check the box to accept the wellness disclaimer (required)

3. **Submit Form**
   - Click "Register" or "Sign Up"
   - You will be automatically assigned to **Free tier**
   - You will be redirected to the dashboard

### Logging In

1. **Navigate to Login Page**
   - Go to `https://flowlogic.shop/login`
   - Or click "Login" from the home page

2. **Enter Credentials**
   - **Email:** Your registered email
   - **Password:** Your password

3. **Submit**
   - Click "Login"
   - You will be redirected to the dashboard

### Wellness Disclaimer

On your first login, you will see a **Wellness Disclaimer** modal:

- **Read the disclaimer** carefully
- **Accept** to continue using the platform
- The disclaimer explains that Flow Logic is a wellness product, not a medical product
- You can view the disclaimer later in your account settings

---

## 💳 Choosing a Tier

Flow Logic offers **4 tiers** with different features:

### Tier Comparison

| Feature | Free | Basic | Pro | Pro+ |
|---------|------|-------|-----|------|
| **Tests per month** | 3 | 3 | 7 | 15 |
| **Results** | ✅ Score + Problem Areas | ✅ Score + Problem Areas | ✅ Extended Results | ✅ Full Results + Pose Accuracy |
| **Exercises** | ❌ | ✅ | ✅ | ✅ |
| **Training Plans** | ❌ | ✅ Lite | ✅ Full | ✅ Full |
| **Smart Calendar** | ❌ | ✅ | ✅ | ✅ |
| **Progress Charts** | ❌ | ✅ | ✅ | ✅ |
| **Retention Features** | ❌ | ❌ | ❌ | ✅ |
| **Price** | Free | $9.99/mo | $14.99/mo | $19.99/mo |

### Upgrading to a Paid Tier

1. **Navigate to Tiers Page**
   - Go to `https://flowlogic.shop/tiers`
   - Or click "Tiers" from the dashboard

2. **Select a Tier**
   - Review the features of each tier
   - Click "Upgrade" on your desired tier

3. **Complete Payment**
   - You will be redirected to Stripe checkout
   - Enter your payment information
   - Complete the payment

4. **Activation**
   - Your tier will be activated immediately after payment
   - You will receive a confirmation notification
   - Paid features will be available immediately

### Canceling Subscription

1. **Navigate to Settings**
   - Go to your account settings
   - Click "Subscription" or "Billing"

2. **Cancel Subscription**
   - Click "Cancel Subscription"
   - Confirm the cancellation

3. **Access Retention**
   - You will retain access until the end of your paid period
   - After the period ends, you will automatically downgrade to **Free tier**
   - Paid features will be blocked after downgrade

---

## 🎬 Taking Assessment Tests

### Starting a Test

1. **Navigate to Assessments Page**
   - Go to `https://flowlogic.shop/assessments`
   - Or click "Assessments" from the dashboard

2. **Select a Test**
   - You will see a list of available tests based on your tier:
     - **Free/Basic:** 3 tests
     - **Pro:** 7 tests
     - **Pro+:** 15 tests
   - Click on a test to start

3. **Read Instructions**
   - Review the test instructions
   - Ensure you have:
     - Good lighting
     - Enough space
     - Camera access enabled

4. **Start Recording**
   - Click "Start Recording"
   - Grant camera permission if prompted
   - Position yourself according to instructions

### Recording the Test

1. **Recording Process**
   - The camera will activate
   - A timer will show the recording duration (maximum 45 seconds)
   - Follow the test instructions while recording

2. **Stop Recording**
   - Click "Stop Recording" when finished
   - Or wait for the timer to reach 45 seconds (auto-stop)

3. **Preview Video**
   - Review your recorded video
   - If satisfied, click "Submit"
   - If not satisfied, click "Re-record" (up to 3 attempts per day per test)

### Test Limits

- **Monthly Limit:** You can complete a maximum number of distinct tests per calendar month:
  - **Free/Basic:** 3 tests/month
  - **Pro:** 7 tests/month
  - **Pro+:** 15 tests/month

- **Daily Attempts:** Each test allows up to **3 video attempts per day**
  - If a test fails MediaPipe validation, you can retry (up to 3 attempts)
  - After 3 failed attempts, you must wait until the next day

### Processing Status

After submitting a video:

1. **Upload Status**
   - You will see an upload progress indicator
   - The video is uploaded to S3

2. **Processing Status**
   - You will see a "Processing" screen
   - The system analyzes your video using MediaPipe
   - Status updates automatically

3. **Results Ready**
   - When processing is complete, you will be redirected to results
   - If processing fails, you will see an error message with instructions

### Handling Invalid Videos

If your video fails MediaPipe validation:

1. **Error Message**
   - You will see a specific error reason:
     - `TOO_LONG` - Video exceeds 45 seconds
     - `NO_MOTION` - Insufficient movement detected
     - `BAD_LIGHTING` - Poor lighting conditions
     - `LOW_CONFIDENCE` - MediaPipe confidence too low

2. **Instructions**
   - Follow the provided instructions to fix the issue
   - Reposition yourself, improve lighting, or adjust distance

3. **Re-record**
   - Click "Re-record" if you have attempts remaining
   - You can retry up to 3 times per day per test

---

## 📊 Viewing Results

### Test Results Page

1. **Access Results**
   - After test processing, you will be redirected to results
   - Or navigate to `https://flowlogic.shop/assessments/{test_id}/results`

2. **Results Display**
   - **Score:** Overall assessment score (0-100)
   - **Problem Areas:** List of identified problem areas
   - **Confidence:** MediaPipe confidence level
   - **Details:** Extended details (Pro/Pro+)

### Understanding Results

- **Score (0-100):**
  - **90-100:** Excellent movement quality
  - **75-89:** Good movement quality
  - **60-74:** Limited movement quality
  - **0-59:** Significant movement quality issues

- **Problem Areas:**
  - Specific body areas with movement issues
  - Recommendations for improvement

- **Pro+ Features:**
  - More detailed pose accuracy metrics
  - Extended analysis and recommendations

### Test History

1. **View History**
   - Go to `https://flowlogic.shop/assessments`
   - Click "History" or "Past Tests"
   - View all your completed tests

2. **Filter & Sort**
   - Filter by date, test type, or score
   - Sort by date (newest/oldest) or score (highest/lowest)

---

## 💪 Exercises & Training Plans (Basic+)

### Accessing Exercises

**Note:** Exercises and training plans are available only for **Basic, Pro, and Pro+** tiers.

1. **Navigate to Exercises**
   - Go to `https://flowlogic.shop/exercises`
   - Or click "Exercises" from the dashboard

2. **View Exercises**
   - Exercises are generated based on your test results
   - Each exercise includes:
     - Instructions
     - Video demonstration (if available)
     - Repetitions and sets
     - Difficulty level

### Training Plans

1. **Access Training Plan**
   - Go to `https://flowlogic.shop/plans`
   - Or click "Training Plan" from the dashboard

2. **View Plan**
   - Your personalized training plan based on test results
   - Plan includes:
     - Daily exercises
     - Weekly schedule
     - Progress milestones

### Smart Calendar (Basic+)

1. **Access Calendar**
   - Go to `https://flowlogic.shop/calendar`
   - Or click "Calendar" from the dashboard

2. **Daily Tasks**
   - View 2-4 daily tasks
   - Mark tasks as complete
   - Track your streak

3. **Streak Tracking**
   - Maintain a daily streak by completing tasks
   - View your current streak on the dashboard

---

## 📈 Progress Tracking (Basic+)

### Progress Dashboard

1. **Access Dashboard**
   - Go to `https://flowlogic.shop/dashboard`
   - View your progress overview

2. **Charts & Visualizations**
   - **Streak Chart:** Daily completion streak
   - **Completion Chart:** Task completion over time
   - **Improvement Chart:** Score improvements over time

### Metrics

- **Streak:** Consecutive days with completed tasks
- **Completion Rate:** Percentage of completed tasks
- **Improvements:** Score improvements over time
- **Test History:** All completed tests

---

## ⚙️ Account Management

### Profile Settings

1. **Access Settings**
   - Click your profile icon
   - Select "Settings" or "Profile"

2. **Update Profile**
   - Change your name
   - Update email (if supported)
   - View wellness disclaimer

### Subscription Management

1. **View Subscription**
   - Go to Settings → Subscription
   - View current tier and billing information

2. **Upgrade/Downgrade**
   - Click "Change Plan" to upgrade
   - Click "Cancel Subscription" to downgrade

3. **Billing History**
   - View past invoices
   - Download receipts

---

## ❓ FAQ

### General Questions

**Q: Is Flow Logic a medical product?**  
A: No, Flow Logic is a **wellness product only**. It does not provide medical diagnosis or treatment.

**Q: What devices are supported?**  
A: Flow Logic works on desktop and mobile browsers with camera access (Chrome, Firefox, Safari, Edge).

**Q: Can I use Flow Logic on mobile?**  
A: Yes, Flow Logic is responsive and works on mobile devices. Ensure you grant camera permissions.

### Tier Questions

**Q: What's the difference between Free and Basic?**  
A: Free tier provides 3 tests/month with results only. Basic tier adds exercises, training plans, and progress tracking.

**Q: Can I upgrade from Free to Pro+?**  
A: Yes, you can upgrade to any tier at any time. Your new tier will be activated immediately after payment.

**Q: What happens if I cancel my subscription?**  
A: You retain access until the end of your paid period. After that, you downgrade to Free tier and lose access to paid features.

### Test Questions

**Q: How many tests can I take per month?**  
A: It depends on your tier:
- **Free/Basic:** 3 tests/month
- **Pro:** 7 tests/month
- **Pro+:** 15 tests/month

**Q: What if my video fails validation?**  
A: You can retry up to 3 times per day per test. Follow the error instructions to fix the issue.

**Q: How long does processing take?**  
A: Processing typically takes 30-60 seconds after video upload.

### Technical Questions

**Q: What browsers are supported?**  
A: Modern browsers (Chrome, Firefox, Safari, Edge) with camera access support.

**Q: Do I need to install anything?**  
A: No, Flow Logic is a web application. Just open it in your browser.

**Q: Is my data secure?**  
A: Yes, Flow Logic uses encryption at rest and in transit. See [Security Documentation](docs/security/) for details.

---

## 📞 Support

- **Email:** support@flowlogic.app
- **Documentation:** [docs/](docs/)
- **Troubleshooting:** [Troubleshooting Guide](docs/troubleshooting.md)

---

**Last Updated:** 2025-12-22  
**Version:** 1.0







