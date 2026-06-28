function ProfileCard({ completionPercentage = 0 }) {

    const getProgressColor = () => {
        if (completionPercentage < 40) {
            return "bg-red-500";
        }

        if (completionPercentage < 70) {
            return "bg-yellow-500";
        }

        return "bg-blue-600";
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">

            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                    Profile Completion
                </h2>

                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {completionPercentage}%
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
                    style={{
                        width: `${completionPercentage}%`,
                    }}
                ></div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
                Your profile is{" "}
                <span className="text-blue-600 font-bold">
                    {completionPercentage}% complete
                </span>
            </p>

            {completionPercentage === 100 ? (
                <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                    Your profile is fully completed.
                </div>
            ) : (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm font-medium">
                    Complete your profile to improve job opportunities.
                </div>
            )}

        </div>
    );
}

export default ProfileCard;
