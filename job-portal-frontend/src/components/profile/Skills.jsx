function Skills({ skills = "" }) {

    const skillList = skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">

            <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                    Skills
                </h2>

                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {skillList.length}
                </span>
            </div>

            {skillList.length > 0 ? (

                <div className="flex flex-wrap gap-3">

                    {skillList.map((skill, index) => (

                        <span
                            key={index}
                            className="
                                bg-blue-50
                                text-blue-700
                                px-4
                                py-2
                                rounded-full
                                text-sm
                                font-semibold
                                border
                                border-blue-100
                                hover:bg-blue-100
                                transition
                            "
                        >
                            {skill}
                        </span>

                    ))}

                </div>

            ) : (

                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-center">
                    <p className="text-gray-500 text-sm">
                        No skills added yet.
                    </p>
                </div>

            )}

        </div>
    );
}

export default Skills;