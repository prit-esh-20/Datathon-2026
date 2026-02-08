import random

def find_moderate_trend():
    moderates = []
    # Test some common hashtags/keywords
    test_keywords = [
        "#TechReview", "#GadgetNews", "#StartupLife", "#MarketTrends", 
        "#SustainableLiving", "#DigitalNomad", "#RemoteWork", "#AIupdates",
        "#ClimateAction", "#HealthTips", "#FitnessMotivation", "#TravelVlog",
        "#CookingAtHome", "#DIYProjects", "#HomeDecor", "#PersonalFinance"
    ]
    
    for trend in test_keywords:
        random.seed(trend)
        risk = random.randint(20, 95)
        if 40 <= risk <= 75:
            moderates.append((trend, risk))
            
    return moderates

if __name__ == "__main__":
    results = find_moderate_trend()
    for trend, risk in results:
        print(f"Trend: {trend}, Risk: {risk}")
