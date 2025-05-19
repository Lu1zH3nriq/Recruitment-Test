function renewUserCreditsIfNeeded(user) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let lastRenewal = user.lastCreditsRenewal ? new Date(user.lastCreditsRenewal) : null;
    const lastMonth = lastRenewal ? lastRenewal.getMonth() : null;
    const lastYear = lastRenewal ? lastRenewal.getFullYear() : null;

    const planCredits = {
        premium: 5,
        basic: 2,
        free: 0
    };
    const plan = user.licensed?.licenssType || 'free';
    const maxCredits = planCredits[plan] || 0;

    if (!lastRenewal || lastMonth !== currentMonth || lastYear !== currentYear) {
        if (user.licensed.credits < maxCredits) {
            user.licensed.credits = maxCredits;
        }
        user.lastCreditsRenewal = now.toISOString();
    }
    return user;
}

module.exports = { renewUserCreditsIfNeeded };